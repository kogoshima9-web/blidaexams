"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  HelpCircle,
  CheckCircle,
  Edit,
  Plus,
  Clock,
  Loader2,
  Wrench,
  Download,
  Upload,
} from "lucide-react";
import { getAdminStats, getAdminExams, getAdminSubjects, getAdminSchoolYears, exportBackup, importBackup } from "@/lib/adminDataService";

interface Stats {
  totalExams: number;
  totalQuestions: number;
  publishedExams: number;
  draftExams: number;
}

interface RecentExam {
  id: string;
  university: string;
  year: number;
  isPublished: boolean;
  schoolYear: string;
  subject: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentExams, setRecentExams] = useState<RecentExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFixData = async () => {
    setFixing(true);
    setFixResult("");
    try {
      const res = await fetch("/api/fix-school-year", { method: "POST" });
      const data = await res.json();
      setFixResult(`Fixé: ${data.fixedSubjects?.length || 0} sujets, ${data.removedDuplicateSubjects?.length || 0} doublons supprimés`);
      window.location.reload();
    } catch {
      setFixResult("Erreur lors de la réparation");
    }
    setFixing(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const backup = await exportBackup();
      if (backup) {
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `simplemed-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      alert("Erreur lors de l'export");
    }
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult("");
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const result = await importBackup(backup);
      if (result?.success) {
        setImportResult(`Importé: ${result.results?.exams || 0} examens, ${result.results?.subjects || 0} matières`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportResult("Erreur lors de l'import");
      }
    } catch {
      setImportResult("Fichier invalide");
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    async function loadData() {
      const [statsData, exams, schoolYears, subjects] = await Promise.all([
        getAdminStats(),
        getAdminExams(),
        getAdminSchoolYears(),
        getAdminSubjects(),
      ]);
      
      setStats(statsData);

      const recent = exams
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((exam) => ({
          id: exam.id,
          university: exam.university,
          year: exam.year,
          isPublished: exam.isPublished,
          schoolYear: (schoolYears.find((sy) => sy.id === exam.schoolYearId) as any)?.name || "",
          subject: (subjects.find((s) => s.id === exam.subjectId) as any)?.name || "",
          createdAt: new Date(exam.createdAt).toLocaleDateString("fr-FR"),
        }));

      setRecentExams(recent);
      setIsLoading(false);
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B2635] dark:text-[#DC2626]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-2">
          Tableau de bord
        </h1>
        <p className="text-[#8B7D6B] dark:text-[#78716C]">
          Vue d&apos;ensemble de votre plateforme d&apos;examens
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleFixData}
            disabled={fixing}
            className="flex items-center gap-2 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg transition-colors text-sm"
          >
            <Wrench className="w-4 h-4" />
            {fixing ? "Réparation en cours..." : "Réparer les données"}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Export..." : "Exporter backup"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            {importing ? "Import..." : "Importer backup"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          {fixResult && (
            <span className="text-sm text-[#059669] dark:text-[#34D399]">{fixResult}</span>
          )}
          {importResult && (
            <span className="text-sm text-[#059669] dark:text-[#34D399]">{importResult}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#8B2635]/10 dark:bg-[#DC2626]/10 rounded-lg">
              <FileText className="w-6 h-6 text-[#8B2635] dark:text-[#DC2626]" />
            </div>
          </div>
          <h3 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-1">
            {stats?.totalExams || 0}
          </h3>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">Total Examens</p>
        </div>

        <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#7C3AED]/10 dark:bg-[#A78BFA]/10 rounded-lg">
              <HelpCircle className="w-6 h-6 text-[#7C3AED] dark:text-[#A78BFA]" />
            </div>
          </div>
          <h3 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-1">
            {stats?.totalQuestions || 0}
          </h3>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">Total Questions</p>
        </div>

        <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#059669]/10 dark:text-[#34D399]/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#059669] dark:text-[#34D399]" />
            </div>
          </div>
          <h3 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-1">
            {stats?.publishedExams || 0}
          </h3>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">Examens Publiés</p>
        </div>

        <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#D97706]/10 dark:bg-[#FBBF24]/10 rounded-lg">
              <Edit className="w-6 h-6 text-[#D97706] dark:text-[#FBBF24]" />
            </div>
          </div>
          <h3 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-1">
            {stats?.draftExams || 0}
          </h3>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">Examens Brouillons</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/exams/new"
          className="flex items-center gap-4 p-6 bg-[#8B2635] hover:bg-[#6B1D2A] dark:bg-[#DC2626] dark:hover:bg-[#B91C1C] text-white rounded-xl transition-colors"
        >
          <Plus className="w-8 h-8" />
          <div>
            <h3 className="font-playfair text-lg font-semibold">Créer un Examen</h3>
            <p className="text-[#FECDD3] dark:text[#FECDD3]/70 text-sm">Ajouter un nouvel examen</p>
          </div>
        </Link>

        <Link
          href="/admin/subjects"
          className="flex items-center gap-4 p-6 bg-white dark:bg-[#292524] hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917] border border-[#E8E0D5] dark:border-[#3D3835] rounded-xl transition-colors"
        >
          <Plus className="w-8 h-8 text-[#8B2635] dark:text-[#DC2626]" />
          <div>
            <h3 className="font-playfair text-lg font-semibold text-[#2C1810] dark:text-[#FAF7F2]">Ajouter une Matière</h3>
            <p className="text-[#8B7D6B] dark:text-[#78716C] text-sm">Créer une nouvelle matière</p>
          </div>
        </Link>

        <Link
          href="/admin/school-years"
          className="flex items-center gap-4 p-6 bg-white dark:bg-[#292524] hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917] border border-[#E8E0D5] dark:border-[#3D3835] rounded-xl transition-colors"
        >
          <Plus className="w-8 h-8 text-[#8B2635] dark:text-[#DC2626]" />
          <div>
            <h3 className="font-playfair text-lg font-semibold text-[#2C1810] dark:text-[#FAF7F2]">Gérer les Années</h3>
            <p className="text-[#8B7D6B] dark:text-[#78716C] text-sm">Organiser les années scolaires</p>
          </div>
        </Link>
      </div>

      <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835]">
        <div className="p-6 border-b border-[#E8E0D5] dark:border-[#3D3835]">
          <h2 className="font-playfair text-xl font-semibold text-[#2C1810] dark:text-[#FAF7F2]">
            Examens Récents
          </h2>
        </div>
        <div className="overflow-x-auto">
          {recentExams.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-[#D4C5B3] dark:text-[#57534E] mb-4" />
              <p className="text-[#8B7D6B] dark:text-[#78716C]">
                Aucun examen créé pour le moment
              </p>
              <Link
                href="/admin/exams/new"
                className="inline-flex items-center gap-2 mt-4 text-[#8B2635] dark:text-[#DC2626] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Créer votre premier examen
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E0D5] dark:border-[#3D3835]">
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
                    Statut
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-[#8B7D6B] dark:text-[#78716C]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b border-[#E8E0D5] dark:border-[#3D3835]/50 hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917]"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="text-[#2C1810] dark:text-[#FAF7F2] font-medium hover:text-[#8B2635] dark:hover:text-[#DC2626]"
                      >
                        {exam.university}
                      </Link>
                      <p className="text-sm text-[#8B7D6B] dark:text-[#78716C]">
                        {exam.schoolYear}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[#5C5347] dark:text-[#A8A29E]">
                      {exam.year}
                    </td>
                    <td className="px-6 py-4 text-[#5C5347] dark:text-[#A8A29E]">
                      {exam.subject}
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
                            <Edit className="w-3 h-3" />
                            Brouillon
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[#8B7D6B] dark:text-[#78716C]">
                        <Clock className="w-4 h-4" />
                        {exam.createdAt}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
