'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
  X,
  Check,
  ExternalLink,
  Sparkles,
  StickyNote,
  FilePlus,
} from "lucide-react";
import { getAdminSchoolYears, getAdminSubjects, getAdminUniversities } from "@/lib/adminDataService";
import { SchoolYear, Subject, University } from "@/lib/types";
import { ExtractedQuestion } from "@/lib/geminiService";

interface QuestionForm {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  imageUrl: string;
  pdfLink: string;
}

interface ProcessingFile {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function PDFToQuizPage() {
  const router = useRouter();
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [formData, setFormData] = useState({
    university: "",
    year: new Date().getFullYear(),
    schoolYearId: "",
    subjectId: "",
    originalPdfUrl: "",
  });

  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  useEffect(() => {
    async function load() {
      const [syData, subData, univData] = await Promise.all([
        getAdminSchoolYears(),
        getAdminSubjects(),
        getAdminUniversities(),
      ]);
      setSchoolYears(syData);
      setSubjects(subData);
      setUniversities(univData);
      if (univData.length > 0) {
        setFormData(prev => ({ ...prev, university: univData[0].name }));
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredSubjects = formData.schoolYearId
    ? subjects.filter((s) => s.schoolYearId === formData.schoolYearId)
    : [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedPdf(file);
      setPdfPreview(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleAdditionalFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAdditionalFiles([...additionalFiles, ...Array.from(files)]);
    }
  };

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles(additionalFiles.filter((_, i) => i !== index));
  };

  const extractQuestions = async () => {
    if (!selectedPdf) return;

    setIsExtracting(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedPdf);
      formDataToSend.append('notes', notes);
      
      // Add additional files
      additionalFiles.forEach((file) => {
        formDataToSend.append('additionalFiles', file);
      });

      const response = await fetch('/api/quiz/extract', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        const convertedQuestions: QuestionForm[] = result.questions.map((q: ExtractedQuestion, index: number) => ({
          id: crypto.randomUUID(),
          text: q.questionText || "",
          options: q.options?.map(String) || ["", "", "", ""],
          correctAnswer: Array.isArray(q.correctAnswer) ? (q.correctAnswer[0] || 0) : (q.correctAnswer || 0),
          correctAnswers: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer || 0],
          imageUrl: "",
          pdfLink: "",
        }));

        setQuestions(convertedQuestions);
        setExpandedQuestions(new Set(convertedQuestions.map(q => q.id)));
        
        setMessage({
          type: "success",
          text: `${result.questions.length} questions extracted successfully!`,
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || 'Failed to extract questions',
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: 'Error extracting questions',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      id: crypto.randomUUID(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      imageUrl: "",
      pdfLink: "",
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestions(new Set([...expandedQuestions, newQuestion.id]));
  };

  const updateQuestion = (id: string, data: Partial<QuestionForm>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...data } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    const newExpanded = new Set(expandedQuestions);
    newExpanded.delete(id);
    setExpandedQuestions(newExpanded);
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        const newCorrectAnswer =
          q.correctAnswer >= newOptions.length ? 0 : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      })
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== questionId) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.university || !formData.subjectId || questions.length === 0) {
      setMessage({
        type: "error",
        text: "Veuillez remplir tous les champs et ajouter au moins une question",
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const validQuestions = questions
        .filter((q) => q.text.trim())
        .map((q, index) => {
          const answers = q.correctAnswers || (Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]);
          return {
            id: q.id,
            examId: "",
            text: q.text,
            options: q.options.filter((o) => o.trim()),
            correctAnswer: answers,
            imageUrl: q.imageUrl,
            pdfLink: q.pdfLink,
            order: index + 1,
          };
        });

      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          isPublished: publish,
          questions: validQuestions,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save');
      }

      setMessage({
        type: "success",
        text: publish ? "Examen publié avec succès!" : "Examen enregistré comme brouillon!",
      });

      setTimeout(() => {
        router.push("/admin/exams");
      }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement" });
    } finally {
      setIsSaving(false);
    }
  };

  const resetWorkflow = () => {
    setSelectedPdf(null);
    setPdfPreview(null);
    setQuestions([]);
    setMessage(null);
    setNotes("");
    setAdditionalFiles([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              PDF to Quiz
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Extrayez des questions depuis un PDF avec l'IA
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 mb-6 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* PDF Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload PDF pour Extraction
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Upload Area */}
          <div className="flex-1">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  {selectedPdf ? selectedPdf.name : "Cliquez pour choisir un PDF"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Format: PDF • Max: 10MB
                </p>
              </label>
            </div>

            {selectedPdf && (
              <button
                onClick={extractQuestions}
                disabled={isExtracting}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extraction en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Extraire les questions avec IA
                  </>
                )}
              </button>
            )}
          </div>

          {/* Preview */}
          {pdfPreview && (
            <div className="w-full md:w-64 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe
                src={pdfPreview}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notes & Additional Files Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Notes & Instructions pour l'IA
        </h2>
        
        <div className="space-y-4">
          {/* Notes Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instructions spéciales pour l'extraction (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Exemples:
- Extraire uniquement les questions de pharmacologie
- Ignorer les questions sur les effets secondaires
- Prioriser les questions à choix multiple
- Utiliser le corrigé à la dernière page pour les réponses
- Questions pour étudiants de 3ème année médecine"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              L'IA prendra en compte vos instructions pour une meilleure qualité d'extraction
            </p>
          </div>

          {/* Additional Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FilePlus className="w-4 h-4 inline mr-1" />
              Fichiers supplémentaires (optionnel)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Ajoutez des fichiers supplémentaires (corrigés, annexes, images) que l'IA doit prendre en compte
            </p>
            
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
              onChange={handleAdditionalFilesSelect}
              className="hidden"
              id="additional-files-upload"
              multiple
            />
            <label
              htmlFor="additional-files-upload"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              Ajouter des fichiers
            </label>

            {/* Additional Files List */}
            {additionalFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {additionalFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => removeAdditionalFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam Information - Same as New Exam Page */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informations de l'examen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Université
            </label>
            <select
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner...</option>
              {universities.sort((a, b) => a.order - b.order).map((univ) => (
                <option key={univ.id} value={univ.name}>
                  {univ.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Année
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              min="2000"
              max="2100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Année Scolaire
            </label>
            <select
              value={formData.schoolYearId}
              onChange={(e) =>
                setFormData({ ...formData, schoolYearId: e.target.value, subjectId: "" })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner...</option>
              {schoolYears.sort((a, b) => a.order - b.order).map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Matière
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              disabled={!formData.schoolYearId}
              required
            >
              <option value="">Sélectionner...</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <ExternalLink className="w-4 h-4 inline mr-1" />
              Lien PDF
            </label>
            <input
              type="url"
              value={formData.originalPdfUrl}
              onChange={(e) => setFormData({ ...formData, originalPdfUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Questions Section - Same as New Exam Page */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Questions ({questions.length})
              </h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ajouter une question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {selectedPdf ? "Cliquez sur 'Extraire les questions' pour lancer l'IA" : "Upload un PDF et lancez l'extraction"}
                </p>
                <button
                  onClick={addQuestion}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Ou ajoutez une question manuellement
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                      onClick={() => toggleExpand(question.id)}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="flex-1 font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </span>
                      {expandedQuestions.has(question.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {expandedQuestions.has(question.id) && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Texte de la question
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(question.id, { text: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            placeholder="Entrez votre question..."
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Options de réponse
                            </label>
                            <button
                              onClick={() => addOption(question.id)}
                              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              + Ajouter une option
                            </button>
                          </div>
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const correctAnswers = question.correctAnswers || (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]);
                              const isChecked = correctAnswers.includes(optIndex);
                              return (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const currentAnswers = question.correctAnswers || (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]);
                                    let newAnswers: number[];
                                    if (isChecked) {
                                      newAnswers = currentAnswers.filter((a: number) => a !== optIndex);
                                    } else {
                                      newAnswers = [...currentAnswers, optIndex];
                                    }
                                    updateQuestion(question.id, {
                                      correctAnswer: newAnswers.length === 1 ? newAnswers[0] : newAnswers[0],
                                      correctAnswers: newAnswers,
                                    });
                                  }}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(question.id, optIndex, e.target.value)
                                  }
                                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                  placeholder={`Option ${optIndex + 1}`}
                                />
                                {question.options.length > 2 && (
                                  <button
                                    onClick={() => removeOption(question.id, optIndex)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Cochez la case à côté de la bonne réponse
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              <Image className="w-4 h-4 inline mr-1" />
                              URL de l'image (optionnel)
                            </label>
                            <input
                              type="url"
                              value={question.imageUrl}
                              onChange={(e) =>
                                updateQuestion(question.id, { imageUrl: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              <FileText className="w-4 h-4 inline mr-1" />
                              Lien PDF (optionnel)
                            </label>
                            <input
                              type="url"
                              value={question.pdfLink}
                              onChange={(e) =>
                                updateQuestion(question.id, { pdfLink: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={resetWorkflow}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Nouveau PDF
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSaving || questions.length === 0 || !formData.university || !formData.subjectId}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSaving || questions.length === 0 || !formData.university || !formData.subjectId}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Publier l'examen
          </button>
        </div>
      </div>
    </div>
  );
}