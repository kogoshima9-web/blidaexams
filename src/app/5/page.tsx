"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, ChevronRight, BookOpen, Shield } from "lucide-react";

const years = [
  { id: 1, label: "I", name: "1ère Année", subjects: "Sciences fondamentales" },
  { id: 2, label: "II", name: "2ème Année", subjects: "Morphologie" },
  { id: 3, label: "III", name: "3ème Année", subjects: "Pathologie générale" },
  { id: 4, label: "IV", name: "4ème Année", subjects: "Clinique" },
  { id: 5, label: "V", name: "5ème Année", subjects: "Spécialités" },
  { id: 6, label: "VI", name: "6ème Année", subjects: "Internat" },
  { id: 7, label: "VII", name: "7ème Année", subjects: "Fin d&apos;études" },
];

export default function Design5Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F5E6D3] dark:bg-[#1A1512] transition-colors duration-500">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23000' fill-rule='evenodd' opacity='.5'/%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23000' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <header className="relative z-10 border-b-2 border-[#8B4513]/30 dark:border-[#D4A574]/30 bg-[#F5E6D3]/90 dark:bg-[#1A1512]/90">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#8B4513] dark:border-[#D4A574] bg-[#F5E6D3] dark:bg-[#1A1512] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#8B4513] dark:text-[#D4A574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-cinzel text-2xl text-[#4A3728] dark:text-[#E8D4C4] tracking-wide">
                Blida Exams
              </span>
              <p className="font-cardo text-xs text-[#8B4513]/60 dark:text-[#D4A574]/60 italic">
                Est. 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setLanguage(language === "fr" ? "en" : "fr")} className="flex items-center gap-2 px-4 py-2 rounded border border-[#8B4513]/30 dark:border-[#D4A574]/30 text-[#8B4513] dark:text-[#D4A574] hover:bg-[#8B4513]/10 dark:hover:bg-[#D4A574]/10 transition-colors font-jost">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-10 h-10 rounded-full border border-[#8B4513]/30 dark:border-[#D4A574]/30 flex items-center justify-center text-[#8B4513] dark:text-[#D4A574] hover:bg-[#8B4513]/10 dark:hover:bg-[#D4A574]/10 transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-8 py-20">
        <section className="text-center mb-24 animate-fade-in-up">
          <div className="inline-block mb-8">
            <svg className="w-20 h-20 mx-auto text-[#8B4513]/30 dark:text-[#D4A574]/30" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 5 L55 15 L65 15 L57 22 L60 32 L50 26 L40 32 L43 22 L35 15 L45 15 Z" />
              <path d="M50 20 C30 20 15 35 15 50 C15 70 30 85 50 85 C70 85 85 70 85 50 C85 35 70 20 50 20 M50 30 C62 30 72 38 72 50 C72 62 62 70 50 70 C38 70 28 62 28 50 C28 38 38 30 50 30" />
              <path d="M35 45 L35 55 M40 40 L40 60 M45 48 L45 52 M55 48 L55 52 M60 40 L60 60 M65 45 L65 55" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </div>

          <h1 className="font-cinzel text-5xl md:text-6xl lg:text-7xl text-[#4A3728] dark:text-[#E8D4C4] mb-6 leading-tight">
            Blida Exams
          </h1>

          <p className="font-cardo text-xl md:text-2xl text-[#8B4513]/70 dark:text-[#D4A574]/70 italic mb-4">
            Bibliothèque d&apos;Examens Médicaux
          </p>

          <p className="font-jost text-[#8B4513]/50 dark:text-[#D4A574]/50 max-w-md mx-auto mb-12">
            Votre collection exhaustive d&apos;épreuves médicales pour une préparation complète.
          </p>

          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#8B4513]/30 dark:to-[#D4A574]/30" />
            <Shield className="w-4 h-4 text-[#8B4513]/40 dark:text-[#D4A574]/40" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#8B4513]/30 dark:to-[#D4A574]/30" />
          </div>
        </section>

        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-cardo text-sm text-[#8B4513]/60 dark:text-[#D4A574]/60 uppercase tracking-[0.2em] mb-2">
              Sélectionnez
            </h2>
            <p className="font-cardo text-2xl text-[#4A3728] dark:text-[#E8D4C4] italic">
              Votre Année d&apos;Étude
            </p>
          </div>

          <div className="space-y-4">
            {years.map((year, index) => (
              <button
                key={year.id}
                className="group w-full p-6 rounded-lg bg-[#FAF3EB] dark:bg-[#252017] border border-[#D4C4B0] dark:border-[#3D3428] hover:border-[#8B4513] dark:hover:border-[#D4A574] transition-all duration-300 animate-fade-in-up text-left"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-[#8B4513]/10 dark:bg-[#D4A574]/10 flex items-center justify-center">
                      <span className="font-cardo text-xl text-[#8B4513] dark:text-[#D4A574]">
                        {year.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-cardo text-xl text-[#4A3728] dark:text-[#E8D4C4] mb-1">
                        {year.name}
                      </h3>
                      <p className="font-cardo text-sm text-[#8B4513]/60 dark:text-[#D4A574]/60 italic" dangerouslySetInnerHTML={{ __html: year.subjects }} />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#D4C4B0] dark:text-[#5D5040] group-hover:text-[#8B4513] dark:group-hover:text-[#D4A574] group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-[#FAF3EB] dark:bg-[#252017] border border-[#D4C4B0] dark:border-[#3D3428]">
            <BookOpen className="w-5 h-5 text-[#8B4513] dark:text-[#D4A574]" />
            <p className="font-cardo text-[#8B4513]/70 dark:text-[#D4A574]/70 italic">
              3,500+ Examens • 127 Matières • 7 Années
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t-2 border-[#8B4513]/30 dark:border-[#D4A574]/30 mt-20">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8B4513]/40 dark:text-[#D4A574]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L12 22M2 12L22 12" />
              </svg>
              <p className="font-cardo text-sm text-[#8B4513]/50 dark:text-[#D4A574]/50 italic">
                © 2026 Blida Exams. Tous droits réservés.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="font-cardo text-sm text-[#8B4513]/50 dark:text-[#D4A574]/50 hover:text-[#8B4513] dark:hover:text-[#D4A574] transition-colors italic">À propos</a>
              <a href="#" className="font-cardo text-sm text-[#8B4513]/50 dark:text-[#D4A574]/50 hover:text-[#8B4513] dark:hover:text-[#D4A574] transition-colors italic">Contact</a>
              <a href="#" className="font-cardo text-sm text-[#8B4513]/50 dark:text-[#D4A574]/50 hover:text-[#8B4513] dark:hover:text-[#D4A574] transition-colors italic">Aide</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
