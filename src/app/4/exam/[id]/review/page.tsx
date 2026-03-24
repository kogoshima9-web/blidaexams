"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X, ChevronRight, ChevronLeft, Sparkles, Loader2, Brain, ExternalLink, FileText, Flag } from "lucide-react";
import { Design4Layout, useLocale } from "@/components/design4/Design4Layout";
import { getExamById, submitReport } from "@/lib/dataService";

interface QuizAnswer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  isPartial: boolean;
  score: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  imageUrl?: string;
  pdfLink?: string;
}

function getAIShareLink(ai: "chatgpt" | "gemini", questionText: string, options: string[]): string {
  const context = `Question: ${questionText}\nOptions:\n${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}`;
  
  if (ai === "chatgpt") {
    return `https://chat.openai.com/?model=gpt-4&prompt=${encodeURIComponent("Explique cette question de médecine: " + context)}`;
  } else {
    return `https://gemini.google.com/?prompt=${encodeURIComponent("Explique cette question de médecine: " + context)}`;
  }
}

function ReviewContent({ examId }: { examId: string }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [aiModal, setAiModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load() {
      setMounted(true);
      const foundExam = await getExamById(examId);
      if (foundExam) {
        setExam(foundExam);
        setQuestions(foundExam.questions || []);
      }
      
      // Get answers from URL params or localStorage
      const answersParam = searchParams.get("answers");
      if (answersParam) {
        try {
          setAnswers(JSON.parse(decodeURIComponent(answersParam)));
        } catch (e) {
          const saved = localStorage.getItem(`quiz_${examId}_answers`);
          if (saved) {
            setAnswers(JSON.parse(saved));
          }
        }
      } else {
        const saved = localStorage.getItem(`quiz_${examId}_answers`);
        if (saved) {
          setAnswers(JSON.parse(saved));
        }
      }
    }
    load();
  }, [examId, searchParams]);

  if (!mounted) return null;

  if (!exam) {
    return (
      <div className="text-center py-24 animate-fade-in-up">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-6" />
        <p className="font-cormorant text-2xl text-black/50 dark:text-white/50 italic">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-24 animate-fade-in-up">
        <p className="font-cormorant text-2xl text-black/50 dark:text-white/50 italic mb-8">
          {locale === "fr" ? "Cet examen n'a pas de questions." : "This exam has no questions."}
        </p>
        <Link
          href={`/4/subject/${exam.subjectId}`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-jost uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          {locale === "fr" ? "Retour" : "Back"}
        </Link>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answer = answers.find((a) => a.questionId === question.id);
  const isCorrect = answer?.isCorrect || false;
  const isPartial = answer?.isPartial || false;
  const selectedAnswers = answer?.selectedAnswers ?? [];

  // AI Modal
  if (aiModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 p-8 max-w-md w-full mx-4">
          <h3 className="font-fraunces text-2xl text-black dark:text-white mb-6 text-center">
            {t("ai.select")}
          </h3>
          <div className="space-y-4">
            <a
              href={getAIShareLink("chatgpt", question.text, question.options)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 border border-black/10 dark:border-white/10 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div className="flex-1">
                <p className="font-jost font-medium text-black dark:text-white">{t("ai.chatgpt")}</p>
                <p className="font-cormorant text-sm text-black/50 dark:text-white/50 italic">
                  {locale === "fr" ? "Ouvrir dans ChatGPT" : "Open in ChatGPT"}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-black/30 group-hover:text-black dark:text-white/30 dark:group-hover:text-white transition-colors" />
            </a>
            <a
              href={getAIShareLink("gemini", question.text, question.options)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 border border-black/10 dark:border-white/10 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-jost font-medium text-black dark:text-white">{t("ai.gemini")}</p>
                <p className="font-cormorant text-sm text-black/50 dark:text-white/50 italic">
                  {locale === "fr" ? "Ouvrir dans Gemini" : "Open in Gemini"}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-black/30 group-hover:text-black dark:text-white/30 dark:group-hover:text-white transition-colors" />
            </a>
          </div>
          <button
            onClick={() => setAiModal(false)}
            className="w-full mt-6 py-3 border border-black/20 dark:border-white/20 text-black dark:text-white font-jost uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {locale === "fr" ? "Fermer" : "Close"}
          </button>
        </div>
      </div>
    );
  }

  // Report Modal
  if (reportModal) {
    return (
      <ReportModal
        question={question}
        examId={examId}
        onClose={() => setReportModal(false)}
        locale={locale}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="font-cormorant text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-4">
          {t("review.title")}
        </p>
        <h2 className="font-fraunces text-3xl text-black dark:text-white">
          {exam.university} — {exam.year}
        </h2>
      </div>

      {/* Question Navigation */}
      <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
        {questions.map((q, index) => {
          const ans = answers.find((a) => a.questionId === q.id);
          const isAnswered = !!ans;
          const correctAnswers = q.correctAnswers || [q.correctAnswer];
          const isCorrectAnswer = ans?.isCorrect || false;
          const isPartial = ans?.isPartial || false;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-fraunces text-sm transition-all ${
                currentQuestion === index
                  ? "bg-amber-600 text-white"
                  : isAnswered
                  ? isCorrectAnswer
                    ? "bg-green-500 text-white"
                    : isPartial
                    ? "bg-amber-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-black border border-black/5 dark:border-white/5 p-10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="font-cormorant text-sm text-black/40 dark:text-white/40 uppercase tracking-wider">
            {locale === "fr" ? "Question" : "Question"} #{currentQuestion + 1}
          </p>
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-jost uppercase tracking-wider">
                <Check className="w-3 h-3" />
                {locale === "fr" ? "Correct" : "Correct"}
              </span>
            ) : isPartial ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-jost uppercase tracking-wider">
                ±
                {locale === "fr" ? "Partiel" : "Partial"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-jost uppercase tracking-wider">
                <X className="w-3 h-3" />
                {locale === "fr" ? "Incorrect" : "Incorrect"}
              </span>
            )}
          </div>
        </div>
        
        <p className="font-fraunces text-2xl md:text-3xl text-black dark:text-white leading-relaxed mb-8">
          {question.text}
        </p>

        {question.imageUrl && (
          <div className="mb-8">
            <img
              src={question.imageUrl}
              alt="Question image"
              className="max-w-full rounded-lg"
            />
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option: string, index: number) => {
            const correctAnswers = question.correctAnswers || [question.correctAnswer];
            const isCorrectOption = correctAnswers.includes(index);
            const isSelectedOption = selectedAnswers.includes(index);

            let bgClass = "bg-white dark:bg-black border-black/5 dark:border-white/5";
            let textClass = "text-black dark:text-white";

            if (isCorrectOption) {
              bgClass = "bg-green-50 dark:bg-green-950/30 border-green-500";
              textClass = "text-green-700 dark:text-green-400";
            } else if (isSelectedOption && !isCorrectOption) {
              bgClass = "bg-red-50 dark:bg-red-950/30 border-red-500";
              textClass = "text-red-700 dark:text-red-400";
            }

            return (
              <div
                key={index}
                className={`p-4 border transition-all flex items-center gap-4 ${bgClass}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-fraunces text-lg border ${isCorrectOption || isSelectedOption ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "border-black/20 dark:border-white/20 text-black/40 dark:text-white/40"}`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={`font-cormorant text-lg flex-1 ${textClass}`}>
                  {option}
                </span>
                {isCorrectOption && (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {isSelectedOption && !isCorrectOption && (
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Comparison */}
      {(!isCorrect || isPartial) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="font-cormorant text-sm text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
              {t("review.your.answer")}
            </p>
            {selectedAnswers.length > 0 ? (
              selectedAnswers.map(i => (
                <p key={i} className="font-fraunces text-base text-red-700 dark:text-red-400 mb-1">
                  {String.fromCharCode(65 + i)}) {question.options[i]}
                </p>
              ))
            ) : (
              <p className="font-fraunces text-lg text-red-700 dark:text-red-400">—</p>
            )}
          </div>
          <div className="p-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <p className="font-cormorant text-sm text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">
              {t("review.correct.answer")}
            </p>
            {(question.correctAnswers || [question.correctAnswer]).map(i => (
              <p key={i} className="font-fraunces text-base text-green-700 dark:text-green-400 mb-1">
                {String.fromCharCode(65 + i)}) {question.options[i]}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setAiModal(true)}
          className="flex items-center gap-2 px-6 py-3 border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-jost uppercase tracking-wider transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          {t("review.explain")}
        </button>
        <button
          onClick={() => setReportModal(true)}
          className="flex items-center gap-2 px-6 py-3 border border-red-500 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-jost uppercase tracking-wider transition-colors"
        >
          <Flag className="w-5 h-5" />
          {locale === "fr" ? "Signaler" : "Report"}
        </button>
        
        {question.pdfLink && (
          <a
            href={question.pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 font-jost uppercase tracking-wider transition-colors"
          >
            <FileText className="w-5 h-5" />
            {t("review.pdf")}
          </a>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-6 py-3 transition-colors ${
            currentQuestion === 0
              ? "text-black/30 dark:text-white/30 cursor-not-allowed"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          {locale === "fr" ? "Précédent" : "Previous"}
        </button>
        
        <span className="font-cormorant text-black/60 dark:text-white/60">
          {currentQuestion + 1} / {questions.length}
        </span>
        
        <button
          onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          disabled={currentQuestion === questions.length - 1}
          className={`flex items-center gap-2 px-6 py-3 transition-colors ${
            currentQuestion === questions.length - 1
              ? "text-black/30 dark:text-white/30 cursor-not-allowed"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          {locale === "fr" ? "Suivant" : "Next"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Back to Score */}
      <div className="text-center mt-12">
        <Link
          href={`/4/exam/${examId}`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-jost uppercase tracking-wider hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white dark:hover:text-black transition-colors"
        >
          {locale === "fr" ? "Retour au score" : "Back to score"}
        </Link>
      </div>
    </div>
  );
}

function ReportModal({ question, examId, onClose, locale }: { question: any; examId: string; onClose: () => void; locale: string }) {
  const [reportType, setReportType] = useState("incorrect_answer");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reportTypes = [
    { value: "incorrect_answer", label: locale === "fr" ? "Réponse incorrecte" : "Incorrect answer" },
    { value: "typo", label: locale === "fr" ? "Erreur de frappe/grammaire" : "Typo/Grammar error" },
    { value: "unclear", label: locale === "fr" ? "Question peu claire" : "Unclear question" },
    { value: "wrong_explanation", label: locale === "fr" ? "Explication erronée" : "Wrong explanation" },
    { value: "other", label: locale === "fr" ? "Autre" : "Other" },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitReport(question.id, examId, reportType, description);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
        <h3 className="font-fraunces text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-6 text-center">
          {locale === "fr" ? "Signaler un problème" : "Report a problem"}
        </h3>
        
        <p className="font-cormorant text-sm text-black/40 dark:text-white/40 uppercase tracking-wider mb-2">
          {locale === "fr" ? "Question" : "Question"} #{question.order}
        </p>
        <p className="font-cormorant text-lg text-zinc-700 dark:text-zinc-300 mb-6 line-clamp-3">
          {question.text}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block font-cormorant text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              {locale === "fr" ? "Type de problème" : "Problem type"}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-cormorant"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-cormorant text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              {locale === "fr" ? "Description (optionnel)" : "Description (optional)"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={locale === "fr" ? "Décrivez le problème..." : "Describe the problem..."}
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-cormorant resize-none h-24"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-jost font-medium uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {locale === "fr" ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-jost font-medium uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {submitting ? (locale === "fr" ? "Envoi..." : "Sending...") : (locale === "fr" ? "Envoyer" : "Submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  return (
    <Design4Layout>
      <ReviewContent examId={params.id} />
    </Design4Layout>
  );
}
