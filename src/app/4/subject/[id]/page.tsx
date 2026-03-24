"use client";

import Link from "next/link";
import { BookOpen, Calendar, GraduationCap, Play, ExternalLink, Upload, X, Check, Loader2 } from "lucide-react";
import { Design4Layout, useLocale } from "@/components/design4/Design4Layout";
import { getSubjects, getExams, getSubjectById, getUniversities } from "@/lib/dataService";
import { subjectsStore } from "@/lib/store";
import { useEffect, useState, useRef } from "react";

function ExamCard({ exam, locale }: { exam: any; locale: "fr" | "en" }) {
  const questionCount = exam.questionCount || exam.questions?.length || 0;
  const date = new Date(exam.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="group bg-white dark:bg-black border border-black/5 dark:border-white/5 hover:border-amber-200 dark:hover:border-amber-800 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-950/20">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-right">
          <span className="font-jost text-xs text-black/40 dark:text-white/40 uppercase tracking-wider">
            #{exam.id.slice(0, 6)}
          </span>
          {exam.originalPdfUrl && (
            <a
              href={exam.originalPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <ExternalLink className="w-3 h-3 inline mr-1" />
              PDF
            </a>
          )}
        </div>
      </div>

      <h3 className="font-fraunces text-2xl font-medium text-black dark:text-white mb-4">
        {exam.university}
      </h3>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-black/40 dark:text-white/40" />
          <span className="font-cormorant text-black/60 dark:text-white/60">
            {date}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-black/40 dark:text-white/40" />
          <span className="font-cormorant text-black/60 dark:text-white/60">
            {questionCount} {locale === "fr" ? "questions" : "questions"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
        <span className="font-jost text-sm text-amber-600 dark:text-amber-400">
          {exam.year}
        </span>
        <Link
          href={`/4/exam/${exam.id}`}
          className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-jost text-sm uppercase tracking-wider hover:bg-amber-600 dark:hover:bg-amber-400 hover:text-white dark:hover:text-black transition-all group"
        >
          <Play className="w-4 h-4" />
          {locale === "fr" ? "Commencer" : "Start"}
        </Link>
      </div>
    </div>
  );
}

function ExamSubmissionForm({ subjectName }: { subjectName: string }) {
  const { locale, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError("");
    const newUrls: string[] = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/exam-submissions/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          newUrls.push(data.url);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploadedUrls([...uploadedUrls, ...newUrls]);
    setFiles([...files, ...selectedFiles]);
    setIsUploading(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setUploadedUrls(uploadedUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/exam-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({

          userPhone: formData.get("userPhone"),
          examYear: formData.get("examYear"),
          examUniversity: formData.get("examUniversity"),
          examType: formData.get("examType"),
          notes: formData.get("notes"),
          fileUrls: uploadedUrls,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi.");
        return;
      }

      setSubmitSuccess(true);
      setFiles([]);
      setUploadedUrls([]);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-16 animate-fade-in-up">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-fraunces text-2xl font-medium text-amber-900 dark:text-amber-100 mb-2">
                {locale === "fr" ? "Vous avez un examen à partager ?" : "Do you have an exam to share?"}
              </h3>
              <p className="font-cormorant text-amber-700 dark:text-amber-300 italic">
                {locale === "fr" 
                  ? "Aidez la communauté en partageant vos examens avec les administrateurs."
                  : "Help the community by sharing your exams with the administrators."}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-jost text-sm uppercase tracking-wider rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              {locale === "fr" ? "Envoyer" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 animate-fade-in-up">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-fraunces text-2xl font-medium text-amber-900 dark:text-amber-100">
            {locale === "fr" ? "Envoyer un examen" : "Submit an exam"}
          </h3>
          <button
            onClick={() => { setIsOpen(false); setError(""); }}
            className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="font-fraunces text-xl text-green-700 dark:text-green-300">
              {locale === "fr" ? "Examen envoyé avec succès !" : "Exam submitted successfully!"}
            </p>
            <p className="font-cormorant text-green-600 dark:text-green-400 mt-2">
              {locale === "fr" 
                ? "Merci pour votre contribution !"
                : "Thank you for your contribution!"}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  {locale === "fr" ? "Année" : "Year"}
                </label>
                <input
                  type="number"
                  name="examYear"
                  min={2000}
                  max={2030}
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white"
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  {locale === "fr" ? "Université" : "University"}
                </label>
                <input
                  type="text"
                  name="examUniversity"
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white"
                  placeholder={locale === "fr" ? "Université de..." : "University of..."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  {locale === "fr" ? "Type d'examen" : "Exam type"}
                </label>
                <select
                  name="examType"
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white"
                >
                  <option value="">{locale === "fr" ? "Sélectionner..." : "Select..."}</option>
                  <option value="normal">{locale === "fr" ? "Normal" : "Normal"}</option>
                  <option value="rattrapage">{locale === "fr" ? "Rattrapage" : "Resit"}</option>
                  <option value="partiel">{locale === "fr" ? "Partiel" : "Midterm"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                {locale === "fr" ? "Notes (optionnel)" : "Notes (optional)"}
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white resize-none"
                placeholder={locale === "fr" ? "Informations supplémentaires..." : "Additional information..."}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                <Upload className="w-4 h-4 inline mr-1" />
                {locale === "fr" ? "Fichiers (PDF, images)" : "Files (PDF, images)"}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg p-6 text-center cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {locale === "fr" 
                        ? "Cliquez pour uploader ou glissez-déposez"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-amber-500 dark:text-amber-400 mt-1">
                      PDF, JPEG, PNG, WebP (max 10MB)
                    </p>
                  </>
                )}
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-black border border-amber-200 dark:border-amber-800 rounded-lg">
                      <span className="text-sm text-amber-800 dark:text-amber-200 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setIsOpen(false); setError(""); }}
                className="px-4 py-2 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
              >
                {locale === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-jost text-sm uppercase tracking-wider rounded-lg transition-colors"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {locale === "fr" ? "Envoyer" : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

interface PageContentProps {
  subjectId: string;
}

function ExamListContent({ subjectId }: PageContentProps) {
  const { locale, t } = useLocale();
  const [subject, setSubject] = useState<any>(null);
  const [schoolYear, setSchoolYear] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const sub = await getSubjectById(subjectId);
      setSubject(sub || null);
      if (sub) {
        const years = await getSubjects();
        const sy = years.find((s) => s.id === sub.schoolYearId);
        if (sy) {
          setSchoolYear({ id: sy.id, name: sy.name, shortLabel: (sy as any).shortLabel || sy.name, order: 0 });
        }
      }
      const [allExams, univs] = await Promise.all([
        getExams(subjectId),
        getUniversities()
      ]);
      setExams(allExams);
      setUniversities(univs);
    }
    load();
  }, [subjectId]);

  const filteredExams = exams.filter((exam) => {
    if (filter === "all") return true;
    const univ = universities.find(u => u.id === filter);
    if (univ) {
      return exam.university === univ.name;
    }
    return true;
  });

  if (!subject) {
    return (
      <div className="text-center py-24 animate-fade-in-up">
        <p className="font-cormorant text-2xl text-black/50 dark:text-white/50 italic">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-12">
        <p className="font-cormorant text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-4">
          {schoolYear?.name || t("subjects.title")}
        </p>
        <h2 className="font-fraunces text-4xl md:text-5xl font-light text-black dark:text-white mb-4">
          {subject.name}
        </h2>
        {subject.description && (
          <p className="font-cormorant text-xl text-black/50 dark:text-white/50 italic">
            {subject.description}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-2 font-jost text-sm uppercase tracking-wider transition-all ${
            filter === "all"
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
          }`}
        >
          {locale === "fr" ? "Tous" : "All"}
        </button>
        {universities.sort((a, b) => a.order - b.order).map((univ) => (
          <button
            key={univ.id}
            onClick={() => setFilter(univ.id)}
            className={`px-6 py-2 font-jost text-sm uppercase tracking-wider transition-all ${
              filter === univ.id
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10"
            }`}
          >
            {univ.city || univ.name}
          </button>
        ))}
      </div>

      {filteredExams.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-black/30 dark:text-white/30" />
          </div>
          <p className="font-cormorant text-2xl text-black/50 dark:text-white/50 italic">
            {t("exams.empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
            <div key={exam.id} style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-in-up">
              <ExamCard exam={exam} locale={locale} />
            </div>
          ))}
        </div>
      )}

      <ExamSubmissionForm subjectName={subject?.name || ""} />
    </div>
  );
}

export default function SubjectPage({ params }: { params: { id: string } }) {
  return (
    <Design4Layout
      showBack
      backHref={`/4/school-year/${getSchoolYearId(params.id)}`}
      title={{ fr: "Examens disponibles", en: "Available exams" }}
    >
      <ExamListContent subjectId={params.id} />
    </Design4Layout>
  );
}

function getSchoolYearId(subjectId: string): string {
  const sub = subjectsStore.getAll().find((s) => s.id === subjectId);
  return sub?.schoolYearId || "1";
}
