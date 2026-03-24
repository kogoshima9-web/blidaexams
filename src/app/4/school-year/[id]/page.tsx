"use client";

import Link from "next/link";
import { ChevronRight, BookOpen, Brain, Microscope, Pill, Heart, Activity, Stethoscope, Bone, Eye, Zap, FlaskConical } from "lucide-react";
import { Design4Layout, useLocale } from "@/components/design4/Design4Layout";
import { getSchoolYears, getSubjects } from "@/lib/dataService";
import { useEffect, useState } from "react";

function getSubjectIcon(subjectName: string) {
  const name = subjectName.toLowerCase();
  if (name.includes("anatomie") || name.includes("bone")) return Bone;
  if (name.includes("physiologie") || name.includes("activity")) return Activity;
  if (name.includes("biochimie") || name.includes("flask")) return FlaskConical;
  if (name.includes("histologie") || name.includes("microscope")) return Microscope;
  if (name.includes("embryologie") || name.includes("brain")) return Brain;
  if (name.includes("microbiologie") || name.includes("zap")) return Zap;
  if (name.includes("pathologie") || name.includes("stethoscope")) return Stethoscope;
  if (name.includes("pharmacologie") || name.includes("pill")) return Pill;
  if (name.includes("sémiologie") || name.includes("book")) return BookOpen;
  if (name.includes("cardiologie") || name.includes("heart")) return Heart;
  if (name.includes("ophtalmologie") || name.includes("eye")) return Eye;
  return BookOpen;
}

interface PageContentProps {
  schoolYearId: string;
}

function SubjectSelectorContent({ schoolYearId }: PageContentProps) {
  const { locale, t } = useLocale();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [schoolYear, setSchoolYear] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const years = await getSchoolYears();
      const sy = years.find((y) => y.order === parseInt(schoolYearId) || y.id === schoolYearId);
      setSchoolYear(sy || null);
      const subs = await getSubjects(schoolYearId);
      setSubjects(subs);
    }
    load();
  }, [schoolYearId]);

  if (!schoolYear) {
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
      <div className="text-center mb-16">
        <p className="font-cormorant text-sm font-medium text-black/40 dark:text-white/40 uppercase tracking-[0.3em] mb-4">
          {t("school.year")} {schoolYear.shortLabel}
        </p>
        <h2 className="font-fraunces text-4xl md:text-5xl font-light text-black dark:text-white mb-4">
          {schoolYear.name}
        </h2>
        {schoolYear.description && (
          <p className="font-cormorant text-xl text-black/50 dark:text-white/50 italic">
            {schoolYear.description}
          </p>
        )}
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-black/30 dark:text-white/30" />
          </div>
          <p className="font-cormorant text-2xl text-black/50 dark:text-white/50 italic mb-4">
            {locale === "fr" ? "Aucune matière disponible" : "No subjects available"}
          </p>
          <p className="font-cormorant text-black/40 dark:text-white/40">
            {locale === "fr" 
              ? "Les matières seront ajoutées bientôt par l'administrateur."
              : "Subjects will be added soon by the administrator."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => {
            const Icon = getSubjectIcon(subject.name);
            return (
              <Link
                key={subject.id}
                href={`/4/subject/${subject.id}`}
                className="group bg-white dark:bg-black border border-black/5 dark:border-white/5 hover:border-amber-200 dark:hover:border-amber-800 p-8 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-950/20 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                    <Icon size={24} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/20 dark:text-white/20 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-fraunces text-2xl font-medium text-black dark:text-white mb-2">
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="font-cormorant text-black/50 dark:text-white/50 italic">
                    {subject.description}
                  </p>
                )}
                <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                  <span className="font-jost text-xs text-black/40 dark:text-white/40 uppercase tracking-wider">
                    {locale === "fr" ? "Voir les examens →" : "View exams →"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SchoolYearPage({ params }: { params: { id: string } }) {
  return (
    <Design4Layout
      showBack
      backHref="/4"
      title={{ fr: "Sélection de matière", en: "Subject selection" }}
    >
      <SubjectSelectorContent schoolYearId={params.id} />
    </Design4Layout>
  );
}
