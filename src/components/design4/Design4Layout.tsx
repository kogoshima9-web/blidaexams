"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, ChevronLeft, Heart, Palette, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

// Translations
const translations: Record<string, Record<"fr" | "en", string>> = {
  "platform.title": { fr: "Blida Exams", en: "Blida Exams" },
  "nav.about": { fr: "À propos", en: "About" },
  "nav.contact": { fr: "Contact", en: "Contact" },
  "nav.help": { fr: "Aide", en: "Help" },
  "footer.copyright": { fr: "© 2026 Blida Exams", en: "© 2026 Blida Exams" },
  "loading": { fr: "Chargement...", en: "Loading..." },
  "quiz.progress": { fr: "Question", en: "Question" },
  "quiz.of": { fr: "sur", en: "of" },
  "quiz.verify": { fr: "Vérifier", en: "Verify" },
  "quiz.next": { fr: "Suivant", en: "Next" },
  "quiz.finish": { fr: "Terminer", en: "Finish" },
  "quiz.correct": { fr: "Correct !", en: "Correct!" },
  "quiz.incorrect": { fr: "Incorrect", en: "Incorrect" },
  "quiz.score": { fr: "Votre score", en: "Your score" },
  "quiz.review": { fr: "Revoir les réponses", en: "Review answers" },
  "quiz.retake": { fr: "Refaire l'examen", en: "Retake exam" },
  "quiz.back.home": { fr: "Retour à l'accueil", en: "Back to home" },
  "review.title": { fr: "Revue des réponses", en: "Answer review" },
  "review.back": { fr: "Retour au score", en: "Back to score" },
  "review.your.answer": { fr: "Votre réponse", en: "Your answer" },
  "review.correct.answer": { fr: "Bonne réponse", en: "Correct answer" },
  "review.explain": { fr: "Expliquer avec IA", en: "Explain with AI" },
  "review.pdf": { fr: "Voir PDF", en: "View PDF" },
  "ai.select": { fr: "Choisir l'IA", en: "Select AI" },
  "ai.chatgpt": { fr: "ChatGPT", en: "ChatGPT" },
  "ai.gemini": { fr: "Gemini", en: "Gemini" },
  "school.year": { fr: "Année Scolaire", en: "School Year" },
  "subjects.title": { fr: "Sélectionnez une matière", en: "Select a subject" },
  "exams.title": { fr: "Examens disponibles", en: "Available exams" },
  "exams.empty": { fr: "Aucun examen disponible", en: "No exams available" },
  "exams.questions": { fr: "questions", en: "questions" },
  "exams.start": { fr: "Commencer", en: "Start" },
};

interface LocaleContextType {
  locale: "fr" | "en";
  setLocale: (l: "fr" | "en") => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
});

export function useLocale() {
  return useContext(LocaleContext);
}

interface Design4LayoutProps {
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
  title?: { fr: string; en: string };
  subtitle?: { fr: string; en: string };
}

export function Design4Layout({
  children,
  showBack = false,
  backHref,
  title,
  subtitle,
}: Design4LayoutProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("blida_locale");
    if (saved === "fr" || saved === "en") {
      setLocale(saved);
    }
  }, []);

  const t = (key: string): string => {
    return translations[key]?.[locale] || key;
  };

  const handleLocaleChange = (l: "fr" | "en") => {
    setLocale(l);
    localStorage.setItem("blida_locale", l);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const isHomePage = pathname === "/4" || pathname === "/";

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleLocaleChange, t }}>
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-500">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-amber-50/50 via-transparent to-transparent dark:from-amber-950/10" />
        </div>

        <header className="relative z-10 backdrop-blur-xl bg-white/50 dark:bg-black/50 border-b border-black/5 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBack && backHref ? (
                <Link
                  href={backHref}
                  className="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
              ) : null}
              <Link href="/4" className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white dark:text-black" />
                </div>
                <span className="font-cormorant text-2xl font-semibold text-black dark:text-white tracking-wide">
                  {t("platform.title")}
                </span>
              </Link>
            </div>

            {title && !isHomePage && (
              <div className="hidden md:block text-center">
                <h1 className="font-fraunces text-xl font-light text-black dark:text-white">
                  {title[locale]}
                </h1>
                {subtitle && (
                  <p className="font-cormorant text-sm text-black/50 dark:text-white/50 italic">
                    {subtitle[locale]}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLocaleChange(locale === "fr" ? "en" : "fr")}
                className="px-4 py-2 text-xs font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-jost"
              >
                {locale}
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

        <main className="relative z-10 max-w-6xl mx-auto px-8 py-12">{children}</main>

        <footer className="relative z-10 border-t border-black/5 dark:border-white/5">
          <div className="max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="font-cormorant text-sm text-black/40 dark:text-white/40 italic">
              {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-8">
              <a href="#" className="font-cormorant text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors italic">
                {t("nav.about")}
              </a>
              <a href="#" className="font-cormorant text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors italic">
                {t("nav.contact")}
              </a>
              <a href="#" className="font-cormorant text-sm text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors italic">
                {t("nav.help")}
              </a>
            </div>
          </div>

          {/* Design Switcher */}
          {/* Removed theme switcher 1-5 */}
        </footer>
      </div>
    </LocaleContext.Provider>
  );
}
