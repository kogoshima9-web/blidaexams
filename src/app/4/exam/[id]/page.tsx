"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, ChevronRight, ChevronLeft, Sparkles, Loader2, RotateCcw, Home, Brain, ExternalLink, Flag } from "lucide-react";
import { Design4Layout, useLocale } from "@/components/design4/Design4Layout";
import { getExamById, submitReport } from "@/lib/dataService";

interface QuizAnswer {
  questionId: string;
  selectedAnswers: number[];
  isCorrect: boolean;
  isPartial: boolean;
  score: number;
}

function getAIShareLink(ai: "chatgpt" | "gemini", questionText: string, options: string[]): string {
  const context = `Explique cette question de médecine:\n\nQuestion: ${questionText}\nOptions:\n${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}`;
  
  if (ai === "chatgpt") {
    return `https://chatgpt.com/?model=gpt-4o&prompt=${encodeURIComponent(context)}`;
  } else {
    navigator.clipboard.writeText(context);
    return `https://gemini.google.com`;
  }
}

function QuizContent({ examId }: { examId: string }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load() {
      setMounted(true);
      const foundExam = await getExamById(examId);
      if (foundExam && foundExam.isPublished) {
        setExam(foundExam);
      }
    }
    load();
  }, [examId]);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (answers.length > 0) {
      localStorage.setItem(`quiz_${examId}_answers`, JSON.stringify(answers));
    }
  }, [answers, examId]);

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

  const questions = exam.questions;
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-24 animate-fade-in-up">
        <p className="font-cormorant text-2xl text-black/50 dark:text-white/50 italic mb-8">
          {locale === "fr" ? "Cet examen n'a pas encore de questions." : "This exam has no questions yet."}
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
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleVerify = () => {
    if (selectedAnswers.length === 0) return;

    const correctAnswers = question.correctAnswers || [question.correctAnswer];
    const correctSet = new Set(correctAnswers);
    const selectedSet = new Set(selectedAnswers);

    const hasAllCorrect = correctAnswers.every(a => selectedSet.has(a));
    const hasNoWrong = selectedAnswers.every(a => correctSet.has(a));
    const isCorrect = hasAllCorrect && hasNoWrong;
    const totalCorrect = correctAnswers.length;
    const selectedCorrect = selectedAnswers.filter(a => correctSet.has(a)).length;
    const isPartial = !isCorrect && selectedCorrect > 0;
    const score = isCorrect ? 1 : isPartial ? (selectedCorrect / totalCorrect) : 0;

    const newAnswer: QuizAnswer = {
      questionId: question.id,
      selectedAnswers,
      isCorrect,
      isPartial,
      score,
    };
    setAnswers([...answers, newAnswer]);
    setIsVerified(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers([]);
      setIsVerified(false);
    } else {
      setIsFinished(true);
      setShowScore(true);
    }
  };

  const handleRetake = () => {
    localStorage.removeItem(`quiz_${examId}_answers`);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setIsVerified(false);
    setAnswers([]);
    setIsFinished(false);
    setShowScore(false);
  };

  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const percentage = Math.round((totalScore / questions.length) * 100);

  // Score Screen
  if (showScore) {
    return (
      <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
        <div className="mb-12">
          <p className="font-cormorant text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-4">
            {t("quiz.score")}
          </p>
          <div className="relative inline-block">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-black/10 dark:text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.83} 283`}
                className={percentage >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-fraunces text-5xl font-light text-black dark:text-white">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-black/5 dark:border-white/5 p-8 mb-8">
          <p className="font-cormorant text-3xl text-black dark:text-white mb-2">
            {totalScore.toFixed(1)} / {questions.length}
          </p>
          <p className="font-cormorant text-xl text-black/50 dark:text-white/50 italic">
            {locale === "fr" ? "points" : "points"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/4/exam/${examId}/review`}
            className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-jost uppercase tracking-wider transition-colors"
          >
            <Brain className="w-5 h-5" />
            {t("quiz.review")}
          </Link>
          <button
            onClick={handleRetake}
            className="flex items-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-jost uppercase tracking-wider hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white dark:hover:text-black transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            {t("quiz.retake")}
          </button>
          <Link
            href="/4"
            className="flex items-center gap-3 px-8 py-4 border border-black/20 dark:border-white/20 text-black dark:text-white font-jost uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Home className="w-5 h-5" />
            {t("quiz.back.home")}
          </Link>
        </div>
      </div>
    );
  }

  // AI Modal
  if (aiModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
          <h3 className="font-fraunces text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-6 text-center">
            {t("ai.select")}
          </h3>
          <div className="space-y-3">
            <a
              href={`https://chatgpt.com/?model=gpt-4o&prompt=${encodeURIComponent(`Explique cette question de médecine:\n\nQuestion: ${question.text}\nOptions:\n${question.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white dark:text-black" />
              </div>
              <div className="flex-1">
                <p className="font-jost font-semibold text-zinc-900 dark:text-zinc-100">{t("ai.chatgpt")}</p>
                <p className="font-cormorant text-sm text-zinc-500 dark:text-zinc-400 italic">
                  {locale === "fr" ? "Ouvrir dans ChatGPT" : "Open in ChatGPT"}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </a>
            <button
              onClick={() => {
                const context = `Explique cette question de médecine:\n\nQuestion: ${question.text}\nOptions:\n${question.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}`;
                navigator.clipboard.writeText(context);
                window.open("https://gemini.google.com", "_blank");
              }}
              className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group w-full text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-jost font-semibold text-zinc-900 dark:text-zinc-100">{t("ai.gemini")}</p>
                <p className="font-cormorant text-sm text-zinc-500 dark:text-zinc-400 italic">
                  {locale === "fr" ? "Ouvrir dans Gemini" : "Open in Gemini"}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
          <button
            onClick={() => setAiModal(false)}
            className="w-full mt-6 py-3 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-jost font-medium uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="font-cormorant text-black/60 dark:text-white/60">
            {t("quiz.progress")} {currentQuestion + 1} {t("quiz.of")} {questions.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              AI
            </button>
            <button
              onClick={() => setReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Flag className="w-4 h-4" />
              {locale === "fr" ? "Signaler" : "Report"}
            </button>
          </div>
        </div>
        <div className="h-1 bg-black/10 dark:bg-white/10">
          <div
            className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-black border border-black/5 dark:border-white/5 p-10 mb-8">
        <p className="font-cormorant text-sm text-black/40 dark:text-white/40 uppercase tracking-wider mb-4">
          {locale === "fr" ? "Question" : "Question"} #{currentQuestion + 1}
          {question.correctAnswers && question.correctAnswers.length > 1 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">• {question.correctAnswers.length} réponses</span>
          )}
        </p>
        <p className="font-fraunces text-2xl md:text-3xl text-black dark:text-white leading-relaxed">
          {question.text}
        </p>
        {question.imageUrl && (
          <div className="mt-6">
            <img
              src={question.imageUrl}
              alt="Question image"
              className="max-w-full rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-4 mb-8">
        {question.options.map((option: string, index: number) => {
          const isSelected = selectedAnswers.includes(index);
          const correctAnswers = question.correctAnswers || [question.correctAnswer];
          const isCorrectOption = correctAnswers.includes(index);

          let bgClass = "bg-white dark:bg-black border-black/5 dark:border-white/5";
          let textClass = "text-black dark:text-white";

          if (isVerified) {
            if (isCorrectOption) {
              bgClass = "bg-green-50 dark:bg-green-950/30 border-green-500";
              textClass = "text-green-700 dark:text-green-400";
            } else if (isSelected && !isCorrectOption) {
              bgClass = "bg-red-50 dark:bg-red-950/30 border-red-500";
              textClass = "text-red-700 dark:text-red-400";
            }
          } else if (isSelected) {
            bgClass = "bg-amber-50 dark:bg-amber-950/30 border-amber-500";
            textClass = "text-amber-700 dark:text-amber-400";
          }

          return (
            <button
              key={index}
              onClick={() => !isVerified && setSelectedAnswers(prev =>
                prev.includes(index)
                  ? prev.filter(i => i !== index)
                  : [...prev, index]
              )}
              disabled={isVerified}
              className={`w-full p-6 text-left border transition-all flex items-center gap-6 ${bgClass} ${isVerified ? "" : "hover:border-amber-300 dark:hover:border-amber-600"}`}
            >
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-fraunces text-xl border transition-colors ${isSelected ? "bg-amber-600 dark:bg-amber-400 text-white dark:text-black border-amber-600 dark:border-amber-400" : "border-black/20 dark:border-white/20 text-black/40 dark:text-white/40"}`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className={`font-cormorant text-xl flex-1 ${textClass}`}>
                {option}
              </span>
              {isVerified && isCorrectOption && (
                <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
              {isVerified && isSelected && !isCorrectOption && (
                <X className="w-6 h-6 text-red-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {isVerified && (
        <div className={`p-6 mb-8 border ${answers[answers.length - 1]?.isCorrect ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : answers[answers.length - 1]?.isPartial ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"}`}>
          <p className={`font-fraunces text-2xl ${answers[answers.length - 1]?.isCorrect ? "text-green-700 dark:text-green-400" : answers[answers.length - 1]?.isPartial ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}`}>
            {answers[answers.length - 1]?.isCorrect
              ? t("quiz.correct")
              : answers[answers.length - 1]?.isPartial
              ? locale === "fr" ? `Partiel — ${Math.round(answers[answers.length - 1].score * 100)}%` : `Partial — ${Math.round(answers[answers.length - 1].score * 100)}%`
              : t("quiz.incorrect")}
          </p>
          {answers[answers.length - 1]?.isPartial && (
            <p className="font-cormorant text-base text-amber-600 dark:text-amber-400 mt-2">
              {locale === "fr"
                ? "Certaines bonnes réponses sélectionnées, mais pas toutes."
                : "Some correct answers selected, but not all."}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/4/subject/${exam.subjectId}`)}
          className="flex items-center gap-2 px-6 py-3 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {locale === "fr" ? "Quitter" : "Exit"}
        </button>
        
        {!isVerified ? (
          <button
            onClick={handleVerify}
            disabled={selectedAnswers.length === 0}
            className={`px-10 py-4 font-jost uppercase tracking-wider transition-all ${
              selectedAnswers.length === 0
                ? "bg-black/10 dark:bg-white/10 text-black/30 dark:text-white/30 cursor-not-allowed"
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white dark:hover:text-black"
            }`}
          >
            {t("quiz.verify")}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white font-jost uppercase tracking-wider transition-colors"
          >
            {currentQuestion < questions.length - 1 ? (
              <>
                {t("quiz.next")}
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              t("quiz.finish")
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ReportModal({ question, examId, onClose, locale }: { question: any; examId: string; onClose: () => void; locale: string }) {
  const [reportType, setReportType] = useState("incorrect_answer");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 500);
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

export default function QuizPage({ params }: { params: { id: string } }) {
  return (
    <Design4Layout>
      <QuizContent examId={params.id} />
    </Design4Layout>
  );
}
