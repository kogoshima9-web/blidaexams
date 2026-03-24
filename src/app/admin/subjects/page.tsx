"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getAdminSubjects, getAdminSchoolYears, createAdminSubject, updateAdminSubject, deleteAdminSubject } from "@/lib/adminDataService";
import { Subject, SchoolYear } from "@/lib/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", schoolYearId: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subData, syData] = await Promise.all([
      getAdminSubjects(),
      getAdminSchoolYears(),
    ]);
    setSubjects(subData);
    setSchoolYears(syData);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateAdminSubject(editingId, formData);
      setMessage({ type: "success", text: "Matière modifiée avec succès" });
    } else {
      await createAdminSubject(formData);
      setMessage({ type: "success", text: "Matière ajoutée avec succès" });
    }
    
    loadData();
    resetForm();
  };

  const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      schoolYearId: subject.schoolYearId,
      description: subject.description || "",
    });
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAdminSubject(id);
    setDeleteConfirm(null);
    loadData();
    setMessage({ type: "success", text: "Matière supprimée" });
  };

  const resetForm = () => {
    setFormData({ name: "", schoolYearId: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const getSchoolYearName = (id: string) => {
    return schoolYears.find((sy) => sy.id === id)?.name || "";
  };

  const filteredSubjects = selectedYear === "all"
    ? subjects
    : subjects.filter((s) => s.schoolYearId === selectedYear);

  const groupedSubjects = schoolYears
    .sort((a, b) => a.order - b.order)
    .map((year) => ({
      year,
      subjects: filteredSubjects.filter((s) => s.schoolYearId === year.id),
    }))
    .filter((group) => group.subjects.length > 0 || selectedYear === "all");

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
            Matières
          </h1>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">
            Gérez les matières de votre plateforme
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B2635] hover:bg-[#6B1D2A] dark:bg-[#DC2626] dark:hover:bg-[#B91C1C] text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 mb-6 rounded-lg ${
            message.type === "success"
              ? "bg-[#059669]/10 text-[#059669] dark:text-[#34D399] border border-[#059669]/20 dark:border-[#059669]/30"
              : "bg-[#DC2626]/10 text-[#DC2626] dark:text-[#F87171] border border-[#DC2626]/20 dark:border-[#DC2626]/30"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="mb-6">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#292524] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
        >
          <option value="all">Toutes les années</option>
          {schoolYears.sort((a, b) => a.order - b.order).map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-6 mb-6">
          <h2 className="font-playfair text-lg font-semibold text-[#2C1810] dark:text-[#FAF7F2] mb-4">
            {editingId ? "Modifier la matière" : "Nouvelle matière"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C5347] dark:text-[#A8A29E] mb-1">
                  Nom de la matière
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#1C1917] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
                  placeholder="Anatomie"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C5347] dark:text-[#A8A29E] mb-1">
                  Année scolaire
                </label>
                <select
                  value={formData.schoolYearId}
                  onChange={(e) => setFormData({ ...formData, schoolYearId: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#1C1917] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {schoolYears.sort((a, b) => a.order - b.order).map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5C5347] dark:text-[#A8A29E] mb-1">
                Description (optionnel)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#1C1917] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
                placeholder="Description de la matière"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#8B2635] hover:bg-[#6B1D2A] dark:bg-[#DC2626] dark:hover:bg-[#B91C1C] text-white rounded-lg transition-colors"
              >
                {editingId ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {groupedSubjects.length === 0 ? (
          <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-[#D4C5B3] dark:text-[#57534E] mb-4" />
            <p className="text-[#8B7D6B] dark:text-[#78716C]">
              {selectedYear === "all"
                ? "Aucune matière configurée"
                : "Aucune matière pour cette année"}
            </p>
          </div>
        ) : (
          groupedSubjects.map((group) => (
            <div
              key={group.year.id}
              className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] overflow-hidden"
            >
              <div className="px-6 py-4 bg-[#FAF7F2] dark:bg-[#1C1917]/50 border-b border-[#E8E0D5] dark:border-[#3D3835]">
                <h2 className="font-playfair text-lg font-semibold text-[#2C1810] dark:text-[#FAF7F2]">
                  {group.year.name}
                </h2>
              </div>
              <div className="divide-y divide-[#E8E0D5] dark:divide-[#3D3835]">
                {group.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-6 hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#8B2635]/10 dark:bg-[#DC2626]/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#8B2635] dark:text-[#DC2626]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#2C1810] dark:text-[#FAF7F2]">
                          {subject.name}
                        </h3>
                        {subject.description && (
                          <p className="text-sm text-[#8B7D6B] dark:text-[#78716C]">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#8B2635] dark:hover:text-[#DC2626] hover:bg-[#8B2635]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {deleteConfirm === subject.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(subject.id)}
                            className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm rounded-lg transition-colors"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 text-[#5C5347] dark:text-[#A8A29E] hover:bg-[#E8E0D5] dark:hover:bg-[#3D3835] text-sm rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(subject.id)}
                          className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#DC2626]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
