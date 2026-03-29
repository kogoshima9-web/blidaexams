"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Moon, Sun, ChevronRight, Stethoscope, Heart, Palette, Upload, X, Check, Loader2 } from "lucide-react";

const years = [
  { id: "1", label: "1ère Année", desc: "Sciences fondamentales" },
  { id: "2", label: "2ème Année", desc: "Anatomie & Histologie" },
  { id: "3", label: "3ème Année", desc: "Physiopathologie" },
  { id: "4", label: "4ème Année", desc: "Semiologie clinique" },
  { id: "5", label: "5ème Année", desc: "Spécialités médicales" },
  { id: "6", label: "6ème Année", desc: "Stage hospitalier" },
  { id: "7", label: "7ème Année", desc: "Préparation internship" },
];

function ExamSubmissionForm() {
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("blida_locale");
    if (saved === "fr" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

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
      <div className="mb-16 animate-fade-in-up">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-fraunces text-2xl font-medium text-amber-900 dark:text-amber-100 mb-2">
                {language === "fr" ? "Vous avez un examen à partager ?" : "Do you have an exam to share?"}
              </h3>
              <p className="font-cormorant text-amber-700 dark:text-amber-300 italic">
                {language === "fr" 
                  ? "Aidez la communauté en partageant vos examens avec les administrateurs."
                  : "Help the community by sharing your exams with the administrators."}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-jost text-sm uppercase tracking-wider rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              {language === "fr" ? "Envoyer" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 animate-fade-in-up">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-fraunces text-2xl font-medium text-amber-900 dark:text-amber-100">
            {language === "fr" ? "Envoyer un examen" : "Submit an exam"}
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
              {language === "fr" ? "Examen envoyé avec succès !" : "Exam submitted successfully!"}
            </p>
            <p className="font-cormorant text-green-600 dark:text-green-400 mt-2">
              {language === "fr" 
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
                  {language === "fr" ? "Année" : "Year"}
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
                  {language === "fr" ? "Université" : "University"}
                </label>
                <input
                  type="text"
                  name="examUniversity"
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white"
                  placeholder={language === "fr" ? "Université de..." : "University of..."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  {language === "fr" ? "Type d'examen" : "Exam type"}
                </label>
                <select
                  name="examType"
                  className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white"
                >
                  <option value="">{language === "fr" ? "Sélectionner..." : "Select..."}</option>
                  <option value="normal">{language === "fr" ? "Normal" : "Normal"}</option>
                  <option value="rattrapage">{language === "fr" ? "Rattrapage" : "Resit"}</option>
                  <option value="partiel">{language === "fr" ? "Partiel" : "Midterm"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                {language === "fr" ? "Notes (optionnel)" : "Notes (optional)"}
              </label>
              <textarea
                name="notes"
                rows={2}
                className="w-full px-4 py-2 bg-white dark:bg-black border border-amber-300 dark:border-amber-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black dark:text-white resize-none"
                placeholder={language === "fr" ? "Informations supplémentaires..." : "Additional information..."}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                <Upload className="w-4 h-4 inline mr-1" />
                {language === "fr" ? "Fichiers (PDF, images)" : "Files (PDF, images)"}
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
                      {language === "fr" 
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
                {language === "fr" ? "Annuler" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-jost text-sm uppercase tracking-wider rounded-lg transition-colors"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {language === "fr" ? "Envoyer" : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Design4Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("blida_locale");
    if (saved === "fr" || saved === "en") {
      setLanguage(saved);
    }
  }, []);

  const handleLanguageChange = (lang: "fr" | "en") => {
    setLanguage(lang);
    localStorage.setItem("blida_locale", lang);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-amber-50/50 via-transparent to-transparent dark:from-amber-950/10" />
      </div>

      <header className="relative z-10 backdrop-blur-xl bg-white/50 dark:bg-black/50 border-b border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <Heart className="w-5 h-5 text-white dark:text-black" />
            </div>
            <span className="font-cormorant text-2xl font-semibold text-black dark:text-white tracking-wide">
              Blida Exams
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLanguageChange(language === "fr" ? "en" : "fr")}
              className="px-4 py-2 text-xs font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-jost"
            >
              {language}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-white/60" />
              ) : (
                <Moon className="w-5 h-5 text-black/40" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <section className="text-center mb-32 animate-fade-in-up">
          <p className="font-cormorant text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-8">
            {language === "fr" ? "La plateforme d'excellence" : "The excellence platform"}
          </p>

          <h1 className="font-fraunces text-7xl md:text-8xl lg:text-[100px] font-light text-black dark:text-white mb-8 leading-[0.95]">
            Blida
            <br />
            <span className="italic">Exams</span>
          </h1>

          <p className="font-cormorant text-xl md:text-2xl text-black/50 dark:text-white/50 max-w-lg mx-auto mb-16 italic">
            {language === "fr"
              ? "Une expérience raffinée pour votre préparation médicale"
              : "A refined experience for your medical preparation"}
          </p>

          <div className="w-px h-16 bg-black/10 dark:bg-white/10 mx-auto" />
        </section>

        <section className="mb-32">
          <h2 className="font-cormorant text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-12 text-center">
            {language === "fr" ? "Années d'étude" : "Study Years"}
          </h2>

          <ExamSubmissionForm />

          <div className="grid grid-cols-1 gap-px bg-black/5 dark:bg-white/5">
            {years.map((year, index) => (
              <Link
                key={year.id}
                href={`/4/school-year/${year.id}`}
                className="group flex items-center justify-between p-8 bg-white dark:bg-black hover:bg-amber-50 dark:hover:bg-amber-950/10 transition-colors duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-8">
                  <span className="font-fraunces text-4xl font-light text-black/20 dark:text-white/20 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {String(year.id).padStart(2, "0")}
                  </span>
                  <div className="text-left">
                    <h3 className="font-cormorant text-2xl font-medium text-black dark:text-white mb-1">
                      {year.label}
                    </h3>
                    <p className="font-cormorant text-black/50 dark:text-white/50 italic">
                      {year.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-black/20 dark:text-white/20 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-2 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-black/10 dark:border-white/10">
            <Stethoscope className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="font-cormorant text-black/60 dark:text-white/60 italic">
              {language === "fr"
                ? "Plus de 3,000 examens • 127 matières • 7 années"
                : "More than 3,000 exams • 127 subjects • 7 years"}
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-cormorant text-sm text-black/40 dark:text-white/40 italic">
            © 2026 Blida Exams
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="font-cormorant text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors italic">
              {language === "fr" ? "À propos" : "About"}
            </a>
            <a href="#" className="font-cormorant text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors italic">
              {language === "fr" ? "Contact" : "Contact"}
            </a>
            <a href="#" className="font-cormorant text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors italic">
              {language === "fr" ? "Aide" : "Help"}
            </a>
          </div>
        </div>

        {/* Design Switcher */}
        <div className="border-t border-black/5 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-center gap-3">
            <Palette className="w-4 h-4 text-black/30 dark:text-white/30" />
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Link
                  key={num}
                  href={`/${num}`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    num === 4
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black/60 dark:hover:text-white/60"
                  }`}
                >
                  {num}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
