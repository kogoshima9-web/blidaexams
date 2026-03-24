"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Upload,
  FileJson,
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
} from "lucide-react";
import { getAdminSchoolYears, getAdminSubjects, getAdminUniversities } from "@/lib/adminDataService";
import { SchoolYear, Subject, University } from "@/lib/types";

interface QuestionForm {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  imageUrl: string;
  pdfLink: string;
}

type TabType = "form" | "csv" | "json";

export default function NewExamPage() {
  const router = useRouter();
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("form");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    university: "",
    year: new Date().getFullYear(),
    schoolYearId: "",
    subjectId: "",
    originalPdfUrl: "",
  });

  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const [jsonContent, setJsonContent] = useState("");
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [jsonPreview, setJsonPreview] = useState<{ text: string; optionsCount: number }[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [importedQuestions, setImportedQuestions] = useState<QuestionForm[]>([]);

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

  const parseCSV = (content: string) => {
    const lines = content.trim().split("\n");
    const parsed = lines.map((line) => {
      const cells: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          cells.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      return cells;
    });

    if (parsed.length > 1) {
      const headers = parsed[0].map((h) => h.toLowerCase());
      const parsedQuestions: QuestionForm[] = [];

      for (let i = 1; i < parsed.length; i++) {
        const row = parsed[i];
        const q: Partial<QuestionForm> = {
          id: crypto.randomUUID(),
          text: row[headers.indexOf("question")] || "",
          options: [],
          correctAnswer: parseInt(row[headers.indexOf("correct")] || "0") - 1,
          imageUrl: row[headers.indexOf("image")] || "",
          pdfLink: row[headers.indexOf("pdf")] || "",
        };

        for (let j = 1; j <= 6; j++) {
          const optionKey = `option${j}`;
          const idx = headers.indexOf(optionKey);
          if (idx !== -1 && row[idx]) {
            q.options = [...(q.options || []), row[idx]];
          }
        }

        if (q.options?.length === 0) {
          q.options = ["", "", "", ""];
        }

        parsedQuestions.push(q as QuestionForm);
      }

      setImportedQuestions(parsedQuestions);
      setCsvPreview(parsedQuestions.map((q) => [q.text, `${q.options.length} options`]));
    }
  };

  const parseJSON = (content: string) => {
    try {
      const data = JSON.parse(content);
      const parsedQuestions: QuestionForm[] = [];

      const processQuestions = (items: unknown[]) => {
        for (const item of items) {
          if (Array.isArray(item)) {
            processQuestions(item);
          } else if (item && typeof item === "object") {
            const obj = item as Record<string, unknown>;
            if (obj.text || obj.question) {
              parsedQuestions.push({
                id: crypto.randomUUID(),
                text: String(obj.text || obj.question || ""),
                options: Array.isArray(obj.options)
                  ? obj.options.map(String)
                  : ["", "", "", ""],
                correctAnswer: (() => {
                  const normalizeAnswer = (val: unknown): number[] => {
                    if (Array.isArray(val)) {
                      return val.map((v) => {
                        if (typeof v === "number") return v;
                        if (typeof v === "string") {
                          const upper = v.toUpperCase();
                          if (upper.length === 1 && upper >= "A" && upper <= "Z") {
                            return upper.charCodeAt(0) - 65;
                          }
                          const parsed = parseInt(v);
                          if (!isNaN(parsed)) return parsed;
                        }
                        return 0;
                      });
                    }
                    if (typeof val === "number") return [val];
                    if (typeof val === "string") {
                      const upper = val.toUpperCase();
                      if (upper.length === 1 && upper >= "A" && upper <= "Z") {
                        return [upper.charCodeAt(0) - 65];
                      }
                    }
                    return [0];
                  };
                  const answers = normalizeAnswer(obj.correctAnswer || obj.correct);
                  return answers.length === 1 ? answers[0] : answers[0];
                })(),
                correctAnswers: (() => {
                  const normalizeAnswer = (val: unknown): number[] => {
                    if (Array.isArray(val)) {
                      return val.map((v) => {
                        if (typeof v === "number") return v;
                        if (typeof v === "string") {
                          const upper = v.toUpperCase();
                          if (upper.length === 1 && upper >= "A" && upper <= "Z") {
                            return upper.charCodeAt(0) - 65;
                          }
                          const parsed = parseInt(v);
                          if (!isNaN(parsed)) return parsed;
                        }
                        return 0;
                      });
                    }
                    if (typeof val === "number") return [val];
                    if (typeof val === "string") {
                      const upper = val.toUpperCase();
                      if (upper.length === 1 && upper >= "A" && upper <= "Z") {
                        return [upper.charCodeAt(0) - 65];
                      }
                    }
                    return [0];
                  };
                  return normalizeAnswer(obj.correctAnswer || obj.correct);
                })(),
                imageUrl: String(obj.imageUrl || obj.image || ""),
                pdfLink: String(obj.pdfLink || obj.pdf || ""),
              });
            }
          }
        }
      };

      if (Array.isArray(data)) {
        processQuestions(data);
      }

      setImportedQuestions(parsedQuestions);
      setJsonPreview(parsedQuestions.map((q) => ({ text: q.text, optionsCount: q.options.length })));
    } catch {
      setJsonPreview([]);
    }
  };

  const applyImport = (type: "csv" | "json") => {
    if (type === "csv" && csvPreview.length > 0) {
      setQuestions(importedQuestions);
    } else if (type === "json" && jsonPreview.length > 0) {
      setQuestions(importedQuestions);
    }
    setActiveTab("form");
  };

  const handleSubmit = async (publish: boolean) => {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Créer un Examen
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ajoutez un nouvel examen avec ses questions
        </p>
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informations de l&apos;examen
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "form"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Formulaire
          </button>
          <button
            onClick={() => setActiveTab("csv")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "csv"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Import CSV
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "json"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Import JSON
          </button>
        </div>

        <div className="p-6">
          {activeTab === "form" && (
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
                    Aucune question ajoutée
                  </p>
                  <button
                    onClick={addQuestion}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ajouter votre première question
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
                                URL de l&apos;image (optionnel)
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
          )}

          {activeTab === "csv" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coller le contenu CSV
                </label>
                <textarea
                  value={csvContent}
                  onChange={(e) => {
                    setCsvContent(e.target.value);
                    parseCSV(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  rows={10}
                  placeholder={`question,option1,option2,option3,option4,correct,image,pdf\nQuelle est la capitale de la France?,Paris,Lyon,Marseille,Toulouse,1,,`}
                />
              </div>
              {csvPreview.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aperçu ({csvPreview.length} questions)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Question</th>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{row[0]}</td>
                            <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{row[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => applyImport("csv")}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Appliquer l&apos;import
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "json" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coller le contenu JSON
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setJsonContent(content);
                          parseJSON(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="hidden"
                    id="json-file-upload"
                  />
                  <label
                    htmlFor="json-file-upload"
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    📁 Importer un fichier JSON
                  </label>
                </div>
                <textarea
                  value={jsonContent}
                  onChange={(e) => {
                    setJsonContent(e.target.value);
                    parseJSON(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  rows={10}
                  placeholder={`[
  {
    "text": "Question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "imageUrl": "",
    "pdfLink": ""
  }
]`}
                />
              </div>
              {jsonPreview.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aperçu ({jsonPreview.length} questions)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Question</th>
                          <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jsonPreview.map((row, i) => (
                          <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="px-4 py-2 text-gray-900 dark:text-white">{row.text}</td>
                            <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{row.optionsCount} options</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => applyImport("json")}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Appliquer l&apos;import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          onClick={() => handleSubmit(false)}
          disabled={isSaving || !formData.university || !formData.subjectId}
          className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          Enregistrer brouillon
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={isSaving || !formData.university || !formData.subjectId}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          Publier l&apos;examen
        </button>
      </div>
    </div>
  );
}
