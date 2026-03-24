"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { getAdminExams, getAdminSubjects, getAdminSchoolYears, deleteAdminExam } from "@/lib/adminDataService";
import { Exam, SchoolYear, Subject } from "@/lib/types";

type FilterType = "all" | "published" | "draft";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [examsData, syData, subData] = await Promise.all([
      getAdminExams(),
      getAdminSchoolYears(),
      getAdminSubjects(),
    ]);
    setExams(examsData);
    setSchoolYears(syData);
    setSubjects(subData);
    setIsLoading(false);
  };

  const getSchoolYearName = (id: string) => {
    return schoolYears.find((sy) => sy.id === id)?.name || "";
  };

  const getSubjectName = (id: string) => {
    return subjects.find((s) => s.id === id)?.name || "";
  };

  const handleTogglePublish = async (id: string) => {
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      await fetch('/api/exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isPublished: !exam.isPublished }),
      });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAdminExam(id);
    setDeleteConfirm(null);
    loadData();
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === "published") return exam.isPublished;
    if (filter === "draft") return !exam.isPublished;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B2635] dark:text-[#DC2626]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-2">
            Examens
          </h1>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">
            Gérez tous les examens de votre plateforme
          </p>
        </div>
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#8B2635] hover:bg-[#6B1D2A] dark:bg-[#DC2626] dark:hover:bg-[#B91C1C] text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel Examen
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-[#8B7D6B] dark:text-[#78716C]" />
        <div className="flex gap-2">
          {(["all", "published", "draft"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#8B2635] dark:bg-[#DC2626] text-white"
                  : "bg-[#E8E0D5] dark:bg-[#3D3835] text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#D4C5B3] dark:hover:bg-[#57534E]"
              }`}
            >
              {f === "all" && "Tous"}
              {f === "published" && "Publiés"}
              {f === "draft" && "Brouillons"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] overflow-hidden">
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-[#D4C5B3] dark:text-[#57534E] mb-4" />
            <p className="text-[#8B7D6B] dark:text-[#78716C]">
              {filter === "all"
                ? "Aucun examen créé pour le moment"
                : filter === "published"
                ? "Aucun examen publié"
                : "Aucun examen en brouillon"}
            </p>
            {filter === "all" && (
              <Link
                href="/admin/exams/new"
                className="inline-flex items-center gap-2 mt-4 text-[#8B2635] dark:text-[#DC2626] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Créer votre premier examen
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E0D5] dark:border-[#3D3835] bg-[#FAF7F2] dark:bg-[#1C1917]/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Université
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Année
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Matière
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Année Scolaire
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Questions
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Statut
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExams
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-[#E8E0D5] dark:border-[#3D3835]/50 hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#8B2635]/10 dark:bg-[#DC2626]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#8B2635] dark:text-[#DC2626]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#2C1810] dark:text-[#FAF7F2]">
                              {exam.university}
                            </p>
                            <p className="text-sm text-[#8B7D6B] dark:text-[#78716C]">
                              {exam.year}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#5C5347] dark:text-[#A8A29E]">
                        {exam.year}
                      </td>
                      <td className="px-6 py-4 text-[#5C5347] dark:text-[#A8A29E]">
                        {getSubjectName(exam.subjectId)}
                      </td>
                      <td className="px-6 py-4 text-[#5C5347] dark:text-[#A8A29E]">
                        {getSchoolYearName(exam.schoolYearId)}
                      </td>
                      <td className="px-6 py-4 text-[#5C5347] dark:text-[#A8A29E]">
                        {exam.questions.length}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            exam.isPublished
                              ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399]"
                              : "bg-[#D97706]/10 text-[#D97706] dark:text-[#FBBF24]"
                          }`}
                        >
                          {exam.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Publié
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-3 h-3" />
                              Brouillon
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePublish(exam.id)}
                            className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#8B2635] dark:hover:text-[#DC2626] hover:bg-[#8B2635]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                            title={exam.isPublished ? "Dépublier" : "Publir"}
                          >
                            {exam.isPublished ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                          <Link
                            href={`/admin/exams/${exam.id}`}
                            className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#8B2635] dark:hover:text-[#DC2626] hover:bg-[#8B2635]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          {deleteConfirm === exam.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(exam.id)}
                                className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm rounded-lg transition-colors"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835] text-sm rounded-lg transition-colors"
                              >
                                Non
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(exam.id)}
                              className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#DC2626]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
