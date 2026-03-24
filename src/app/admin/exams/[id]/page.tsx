"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
  X,
  Check,
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { getAdminSchoolYears, getAdminSubjects, getAdminExams, updateAdminExam, getAdminUniversities } from "@/lib/adminDataService";
import { SchoolYear, Subject, Exam, University } from "@/lib/types";

interface QuestionForm {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  imageUrl: string;
  pdfLink: string;
}

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.id as string;
  const reportQuestionId = searchParams.get("question");
  const reportId = searchParams.get("report");

  const [exam, setExam] = useState<Exam | null>(null);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeTab, setActiveTab] = useState<"questions" | "reports">("questions");
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [examData, syData, subData, univData, reportsData] = await Promise.all([
        getAdminExams().then(exams => exams.find(e => e.id === examId) || null),
        getAdminSchoolYears(),
        getAdminSubjects(),
        getAdminUniversities(),
        fetch(`/api/reports?examId=${examId}`)
          .then(res => res.json())
          .then(data => Array.isArray(data) ? data : [])
          .catch(() => []),
      ]);
      
      setUniversities(univData);
      setReports(reportsData || []);
      
      if (examData) {
        setExam(examData);
        setFormData({
          university: examData.university,
          year: examData.year,
          schoolYearId: examData.schoolYearId,
          subjectId: examData.subjectId,
          originalPdfUrl: examData.originalPdfUrl || "",
        });
        setQuestions(
          (examData.questions || []).map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options?.length > 0 ? q.options : ["", "", "", ""],
            correctAnswer: q.correctAnswer,
            correctAnswers: q.correctAnswers || [q.correctAnswer],
            imageUrl: q.imageUrl || "",
            pdfLink: q.pdfLink || "",
          }))
        );
      }
      setSchoolYears(syData);
      setSubjects(subData);
      setIsLoading(false);
      setLoadingReports(false);
    }
    load();
  }, [examId]);

  useEffect(() => {
    if (reportQuestionId && questions.length > 0) {
      const questionExists = questions.find(q => q.id === reportQuestionId);
      if (questionExists) {
        setActiveTab("questions");
        setExpandedQuestions(new Set([...expandedQuestions, reportQuestionId]));
        setHighlightedQuestionId(reportQuestionId);
        setTimeout(() => {
          const element = document.getElementById(`question-${reportQuestionId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        setTimeout(() => setHighlightedQuestionId(null), 5000);
      }
    }
  }, [reportQuestionId, questions]);

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

  const handleSubmit = async (publish?: boolean) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const validQuestions = questions
        .filter((q) => q.text.trim())
        .map((q, index) => {
          const answers = q.correctAnswers || (Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer]);
          return {
            id: q.id,
            examId: examId,
            text: q.text,
            options: q.options.filter((o) => o.trim()),
            correctAnswer: answers,
            imageUrl: q.imageUrl,
            pdfLink: q.pdfLink,
            order: index + 1,
          };
        });

      const updateData: any = {
        ...formData,
        questions: validQuestions,
      };

      if (typeof publish === "boolean") {
        updateData.isPublished = publish;
      }

      await updateAdminExam(examId, updateData);

      setMessage({
        type: "success",
        text: publish === true
          ? "Examen publié avec succès!"
          : publish === false
          ? "Examen dépublié avec succès!"
          : "Examen mis à jour avec succès!",
      });

      const exams = await getAdminExams();
      const updated = exams.find(e => e.id === examId);
      if (updated) setExam(updated);
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'enregistrement" });
    } finally {
      setIsSaving(false);
    }
  };

  const resolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
      }
    } catch (err) {
      console.error("Error resolving report:", err);
    }
  };

  const getQuestionNumber = (report: any) => {
    if (report.question_order) {
      return report.question_order;
    }
    const idx = questions.findIndex(q => q.id === report.question_id);
    return idx >= 0 ? idx + 1 : "?";
  };

  const getQuestionIdByOrder = (order: number) => {
    const q = questions[order - 1];
    return q?.id || null;
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      incorrect_answer: "Réponse incorrecte",
      typo: "Erreur de frappe",
      unclear: "Question peu claire",
      wrong_explanation: "Explication erronée",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const scrollToQuestion = (questionId: string) => {
    setActiveTab("questions");
    setExpandedQuestions(new Set([...expandedQuestions, questionId]));
    setHighlightedQuestionId(questionId);
    setTimeout(() => {
      const element = document.getElementById(`question-${questionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    setTimeout(() => setHighlightedQuestionId(null), 3000);
  };

  const getSubjectName = () => {
    const subject = subjects.find(s => s.id === formData.subjectId);
    return subject?.name || "—";
  };

  const getSchoolYearName = () => {
    const year = schoolYears.find(y => y.id === formData.schoolYearId);
    return year?.name || "—";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Examen non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/exams")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Modifier l&apos;Examen
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {exam.university} - {exam.year}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            exam.isPublished
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
          }`}
        >
          {exam.isPublished ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Publié
            </>
          ) : (
            <>
              <X className="w-4 h-4" />
              Brouillon
            </>
          )}
        </span>
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
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 pt-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === "questions"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Questions ({questions.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "reports"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Flag className="w-4 h-4" />
                Signalements ({reports.filter(r => r.status === "pending").length})
              </button>
            </div>
            {activeTab === "questions" && (
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ajouter une question
              </button>
            )}
          </div>
        </div>

        {activeTab === "questions" && (
          <div className="p-6">
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
                    id={`question-${question.id}`}
                    className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-500 ${
                      highlightedQuestionId === question.id
                        ? "ring-4 ring-indigo-500 ring-opacity-50 bg-indigo-50 dark:bg-indigo-900/20"
                        : ""
                    }`}
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



        {activeTab === "reports" && (
          <div className="p-6">
            {loadingReports ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun signalement pour cet examen
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg ${
                      report.status === "pending"
                        ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                        : report.status === "resolved"
                        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          report.status === "pending" ? "text-red-500" : "text-gray-400"
                        }`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              Question #{getQuestionNumber(report)}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              • {formData.university} • {formData.year}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getSubjectName()} • {getSchoolYearName()} •{" "}
                            {getReportTypeLabel(report.report_type)} •{" "}
                            {new Date(report.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === "pending"
                          ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                          : report.status === "resolved"
                          ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}>
                        {report.status === "pending" ? "En attente" : report.status === "resolved" ? "Résolu" : "Rejeté"}
                      </span>
                    </div>

                    {report.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 pl-8">
                        {report.description}
                      </p>
                    )}

                    {report.status === "pending" && (
                      <div className="flex gap-2 pl-8">
                        <button
                          onClick={() => {
                            const order = getQuestionNumber(report);
                            if (order !== "?") {
                              const question = questions[order - 1];
                              if (question) {
                                scrollToQuestion(question.id);
                              }
                            }
                          }}
                          className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                        >
                          Modifier la question
                        </button>
                        <button
                          onClick={() => resolveReport(report.id, "resolved")}
                          className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        >
                          Marquer résolu
                        </button>
                        <button
                          onClick={() => resolveReport(report.id, "dismissed")}
                          className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors"
                        >
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div className="hidden">

        <div className="p-6">
          {loadingReports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun signalement pour cet examen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg ${
                    report.status === "pending"
                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                      : report.status === "resolved"
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        report.status === "pending" ? "text-red-500" : "text-gray-400"
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Question #{getQuestionNumber(report)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getReportTypeLabel(report.report_type)} •{" "}
                          {new Date(report.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === "pending"
                        ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                        : report.status === "resolved"
                        ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}>
                      {report.status === "pending" ? "En attente" : report.status === "resolved" ? "Résolu" : "Rejeté"}
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 pl-8">
                      {report.description}
                    </p>
                  )}

                  {report.status === "pending" && (
                    <div className="flex gap-2 pl-8">
                      <button
                        onClick={() => {
                          const order = getQuestionNumber(report);
                          if (order !== "?") {
                            const question = questions[order - 1];
                            if (question) {
                              scrollToQuestion(question.id);
                            }
                          }
                        }}
                        className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                      >
                        Modifier la question
                      </button>
                      <button
                        onClick={() => resolveReport(report.id, "resolved")}
                        className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        Marquer résolu
                      </button>
                      <button
                        onClick={() => resolveReport(report.id, "dismissed")}
                        className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded transition-colors"
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {exam.isPublished ? (
              <>
                <EyeOff className="w-5 h-5" />
                Dépublier
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Garder brouillon
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/exams")}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
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
            {exam.isPublished ? "Mettre à jour" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
