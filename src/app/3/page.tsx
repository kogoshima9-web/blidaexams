"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Globe, Zap, ChevronRight, Sparkles, Rocket } from "lucide-react";

const years = [
  { id: 1, label: "1ère Année", color: "from-violet-500 to-purple-500", icon: "🧬" },
  { id: 2, label: "2ème Année", color: "from-fuchsia-500 to-pink-500", icon: "🦴" },
  { id: 3, label: "3ème Année", color: "from-pink-500 to-rose-500", icon: "💊" },
  { id: 4, label: "4ème Année", color: "from-red-500 to-orange-500", icon: "🏥" },
  { id: 5, label: "5ème Année", color: "from-amber-500 to-yellow-500", icon: "⚕️" },
  { id: 6, label: "6ème Année", color: "from-lime-500 to-green-500", icon: "🩺" },
  { id: 7, label: "7ème Année", color: "from-cyan-500 to-teal-500", icon: "🎓" },
];

export default function Design3Page() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0F0F1A] dark:bg-[#050508] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-full blur-[150px] animate-spin-slow" />
      </div>

      <header className="relative z-10 backdrop-blur-2xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 p-[2px]">
                <div className="w-full h-full rounded-xl bg-[#0F0F1A] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-fuchsia-400" />
                </div>
              </div>
            </div>
            <span className="font-space text-white font-bold text-xl tracking-tight">
              Blida<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Exams</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setLanguage(language === "fr" ? "en" : "fr")} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors font-space">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <section className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-8 animate-fade-in-up font-space">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Nouveau: Assistance IA intégrée</span>
          </div>

          <h1 className="font-space text-6xl md:text-7xl lg:text-[120px] font-bold text-white mb-8 leading-[0.9] tracking-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">Blida</span>
            <br />
            <span className="text-white">Exams</span>
          </h1>

          <p className="font-space text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            La plateforme d&apos;examens médicaux la plus audacieuse. Préparez-vous comme jamais.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <button className="group relative px-8 py-4 rounded-2xl font-space font-semibold text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 animate-gradient" />
              <div className="absolute inset-[2px] bg-[#0F0F1A] rounded-xl" />
              <span className="relative flex items-center gap-2">
                Commencer maintenant
                <Rocket className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="font-space text-2xl font-bold text-white/80 mb-10 text-center">
            Sélectionnez votre année
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {years.map((year, index) => (
              <button
                key={year.id}
                className="group relative p-6 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] animate-fade-in-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${year.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                <div className="absolute inset-[1px] bg-[#0F0F1A] rounded-3xl" />
                <div className={`absolute inset-[1px] bg-gradient-to-br ${year.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl`} />

                <div className="relative text-center font-space">
                  <span className="text-5xl mb-4 block">{year.icon}</span>
                  <h3 className="text-lg font-bold text-white mb-1">{year.label}</h3>
                  <div className="flex items-center justify-center gap-1 text-slate-500 group-hover:text-white transition-colors">
                    <span className="text-sm">Explorer</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="relative rounded-[32px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 animate-gradient" />
          <div className="absolute inset-[2px] bg-[#0F0F1A] rounded-[30px]" />
          <div className="relative p-10 md:p-16 text-center">
            <h3 className="font-space text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à dominar vos examens?
            </h3>
            <p className="font-space text-slate-400 mb-8 max-w-lg mx-auto">
              Rejoignez des milliers d&apos;étudiants qui se préparent avec Blida Exams.
            </p>
            <button className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors font-space">
              Commencer gratuitement
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-space text-sm text-slate-500">© 2026 Blida Exams. Forgé pour la prochaine génération.</p>
          <div className="flex items-center gap-6 font-space text-sm">
            <a href="#" className="text-slate-500 hover:text-white transition-colors">À propos</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Contact</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Aide</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
