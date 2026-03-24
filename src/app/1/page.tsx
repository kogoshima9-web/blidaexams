"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, ChevronRight } from "lucide-react";

const years = [
  { id: 1, label: "1ère Année", subtitle: "Bases fondamentales" },
  { id: 2, label: "2ème Année", subtitle: "Morphologie normale" },
  { id: 3, label: "3ème Année", subtitle: "Pathologies fondamentales" },
  { id: 4, label: "4ème Année", subtitle: "Clinique médicale" },
  { id: 5, label: "5ème Année", subtitle: "Spécialités médicales" },
  { id: 6, label: "6ème Année", subtitle: "Internat" },
  { id: 7, label: "7ème Année", subtitle: "Printemps de la carrière" },
];

export default function Design1Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1C1917] transition-colors duration-500">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <header className="relative z-10 border-b border-[#D4C5B3] dark:border-[#3D3835] bg-[#FAF7F2]/90 dark:bg-[#1C1917]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B2635] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="font-jost text-[#2C1810] dark:text-[#E7E5E4] font-semibold text-sm tracking-wide">BLIDA EXAMS</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              className="flex items-center gap-2 text-sm text-[#5C5347] dark:text-[#A8A29E] hover:text-[#8B2635] dark:hover:text-[#DC2626] transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{language}</span>
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full bg-[#E8E0D5] dark:bg-[#292524] flex items-center justify-center text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#D4C5B3] dark:hover:bg-[#3D3835] transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#8B2635]/10 dark:bg-[#DC2626]/10 border border-[#8B2635]/20 dark:border-[#DC2626]/20">
            <span className="font-jost text-xs font-medium text-[#8B2635] dark:text-[#F87171] tracking-wider uppercase">
              Bienvenue à la plateforme
            </span>
          </div>

          <h1 className="font-playfair text-6xl md:text-7xl lg:text-8xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-6 leading-[0.95]">
            Blida Exams
          </h1>

          <p className="font-playfair text-xl md:text-2xl text-[#5C5347] dark:text-[#A8A29E] italic max-w-2xl mx-auto mb-4">
            Votre bibliothèque d&apos;examens médicaux
          </p>
          <p className="font-jost text-[#8B7D6B] dark:text-[#78716C] max-w-xl mx-auto">
            Préparez-vous efficacement à vos examens avec notre collection complète d&apos;épreuves.
          </p>

          <div className="mt-10 flex items-center justify-center gap-2 text-[#8B7D6B] dark:text-[#78716C]">
            <span className="w-12 h-px bg-[#D4C5B3] dark:bg-[#3D3835]"></span>
            <span className="font-jost text-sm">Sélectionnez votre année</span>
            <span className="w-12 h-px bg-[#D4C5B3] dark:bg-[#3D3835]"></span>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {years.map((year, index) => (
            <div
              key={year.id}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#8B2635] to-[#6B1D2A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-[#FFFDF9] dark:bg-[#292524] rounded-2xl p-8 h-full border border-[#E8E0D5] dark:border-[#3D3835] group-hover:border-transparent transition-all duration-300 hover:translate-y-[-4px]">
                <div className="flex items-start justify-between mb-6">
                  <span className="font-playfair text-5xl font-bold text-[#8B2635]/20 dark:text-[#DC2626]/20 group-hover:text-[#8B2635]/30 dark:group-hover:text-[#DC2626]/30 transition-colors">
                    {year.id}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#D4C5B3] dark:text-[#57534E] group-hover:text-[#8B2635] dark:group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="font-playfair text-2xl font-semibold text-[#2C1810] dark:text-[#FAF7F2] mb-2">
                  {year.label}
                </h3>
                <p className="font-jost text-sm text-[#8B7D6B] dark:text-[#78716C]">
                  {year.subtitle}
                </p>

                <div className="mt-6 pt-6 border-t border-[#E8E0D5] dark:border-[#3D3835]">
                  <div className="flex items-center gap-2 text-[#8B2635] dark:text-[#DC2626] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explorer les examens</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-[#FFFDF9] dark:bg-[#292524] border border-[#E8E0D5] dark:border-[#3D3835]">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B2635] to-[#6B1D2A] border-2 border-[#FFFDF9] dark:border-[#292524] flex items-center justify-center text-white text-xs font-medium"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="font-jost text-sm text-[#5C5347] dark:text-[#A8A29E]">
              <span className="font-semibold text-[#2C1810] dark:text-[#FAF7F2]">+2,500+</span> étudiants utilisent Blida Exams
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#D4C5B3] dark:border-[#3D3835] mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-jost text-sm text-[#8B7D6B] dark:text-[#78716C]">
              © 2026 Blida Exams. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 font-jost text-sm text-[#8B7D6B] dark:text-[#78716C]">
              <a href="#" className="hover:text-[#8B2635] dark:hover:text-[#DC2626] transition-colors">À propos</a>
              <a href="#" className="hover:text-[#8B2635] dark:hover:text-[#DC2626] transition-colors">Contact</a>
              <a href="#" className="hover:text-[#8B2635] dark:hover:text-[#DC2626] transition-colors">Aide</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
