"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, ArrowRight, Activity, BookOpen, Users, Award } from "lucide-react";

const years = [
  { id: 1, label: "1ère Année", subjects: 12, icon: "🧬" },
  { id: 2, label: "2ème Année", subjects: 15, icon: "🦴" },
  { id: 3, label: "3ème Année", subjects: 18, icon: "💊" },
  { id: 4, label: "4ème Année", subjects: 22, icon: "🏥" },
  { id: 5, label: "5ème Année", subjects: 25, icon: "⚕️" },
  { id: 6, label: "6ème Année", subjects: 20, icon: "🩺" },
  { id: 7, label: "7ème Année", subjects: 15, icon: "🎓" },
];

const stats = [
  { icon: BookOpen, label: "Examens", value: "3,500+" },
  { icon: Users, label: "Étudiants", value: "2,500+" },
  { icon: Award, label: "Sujets", value: "127" },
  { icon: Activity, label: "Taux de réussite", value: "94%" },
];

export default function Design2Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/10 to-amber-500/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl blur opacity-30 -z-10" />
            </div>
            <span className="font-outfit text-slate-900 dark:text-white font-bold text-lg tracking-tight">
              Blida<span className="text-cyan-600 dark:text-cyan-400">Exams</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-outfit"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <section className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-6 font-outfit">
            <Activity className="w-4 h-4" />
            <span>Plateforme médicale #1 en Algérie</span>
          </div>

          <h1 className="font-outfit text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Préparez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">examens</span>
            <br />médicaux
          </h1>

          <p className="font-outfit text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Accédez à des milliers d&apos;examens corrigés pour réussir votre carrière médicale.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200/50 dark:border-slate-800/50 font-outfit"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <stat.icon className="w-5 h-5 text-cyan-500" />
                <div className="text-left">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-outfit text-2xl font-semibold text-slate-900 dark:text-white mb-8 text-center">
            Choisissez votre année d&apos;étude
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {years.map((year, index) => (
              <button
                key={year.id}
                className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 text-left animate-fade-in-up overflow-hidden font-outfit"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <span className="text-4xl mb-4 block">{year.icon}</span>
                  
                  <h3 className="font-outfit text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {year.label}
                  </h3>
                  
                  <p className="font-outfit text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {year.subjects} matières
                  </p>

                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                    <span className="font-outfit text-sm font-medium">Commencer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-500 p-1">
          <div className="rounded-[22px] bg-white dark:bg-slate-950 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-outfit text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Besoin d&apos;aide avec une question?
                </h3>
                <p className="font-outfit text-slate-600 dark:text-slate-400 mb-6">
                  Utilisez notre assistant IA pour obtenir des explications détaillées sur n&apos;importe quelle question d&apos;examen.
                </p>
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-outfit">
                  Essayer maintenant
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white text-6xl animate-float">
                    🤖
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-outfit text-sm text-slate-500 dark:text-slate-400">
              © 2026 Blida Exams. Conçu pour les futurs médecins.
            </p>
            <div className="flex items-center gap-6 font-outfit text-sm">
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">À propos</a>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Contact</a>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
