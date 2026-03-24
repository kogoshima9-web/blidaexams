"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getAdminSchoolYears, createAdminSchoolYear, updateAdminSchoolYear, deleteAdminSchoolYear } from "@/lib/adminDataService";
import { SchoolYear } from "@/lib/types";

export default function SchoolYearsPage() {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", shortLabel: "", order: 1 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const syData = await getAdminSchoolYears();
    setSchoolYears(syData);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateAdminSchoolYear(editingId, formData);
      setMessage({ type: "success", text: "Année scolaire modifiée avec succès" });
    } else {
      await createAdminSchoolYear(formData);
      setMessage({ type: "success", text: "Année scolaire ajoutée avec succès" });
    }
    
    loadData();
    resetForm();
  };

  const handleEdit = (year: SchoolYear) => {
    setFormData({ name: year.name, shortLabel: year.shortLabel, order: year.order });
    setEditingId(year.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAdminSchoolYear(id);
    setDeleteConfirm(null);
    loadData();
    setMessage({ type: "success", text: "Année scolaire supprimée" });
  };

  const resetForm = () => {
    setFormData({ name: "", shortLabel: "", order: schoolYears.length + 1 });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B2635] dark:text-[#DC2626]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#2C1810] dark:text-[#FAF7F2] mb-2">
            Années Scolaires
          </h1>
          <p className="text-[#8B7D6B] dark:text-[#78716C]">
            Gérez les années scolaires de votre plateforme
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

      {showForm && (
        <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] p-6 mb-6">
          <h2 className="font-playfair text-lg font-semibold text-[#2C1810] dark:text-[#FAF7F2] mb-4">
            {editingId ? "Modifier l'année scolaire" : "Nouvelle année scolaire"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C5347] dark:text-[#A8A29E] mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#1C1917] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
                  placeholder="1ère Année"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C5347] dark:text-[#A8A29E] mb-1">
                  Label court
                </label>
                <input
                  type="text"
                  value={formData.shortLabel}
                  onChange={(e) => setFormData({ ...formData, shortLabel: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#1C1917] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
                  placeholder="1ère"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C5347] dark:text-[#A8A29E] mb-1">
                  Ordre
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-[#E8E0D5] dark:border-[#3D3835] rounded-lg bg-white dark:bg-[#1C1917] text-[#2C1810] dark:text-[#FAF7F2] focus:ring-2 focus:ring-[#8B2635] dark:focus:ring-[#DC2626]"
                  min="1"
                  required
                />
              </div>
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

      <div className="bg-white dark:bg-[#292524] rounded-xl shadow-sm border border-[#E8E0D5] dark:border-[#3D3835] overflow-hidden">
        {schoolYears.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-[#D4C5B3] dark:text-[#57534E] mb-4" />
            <p className="text-[#8B7D6B] dark:text-[#78716C]">
              Aucune année scolaire configurée
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E0D5] dark:divide-[#3D3835]">
            {schoolYears
              .sort((a, b) => a.order - b.order)
              .map((year) => (
                <div
                  key={year.id}
                  className="flex items-center justify-between p-6 hover:bg-[#FAF7F2] dark:hover:bg-[#1C1917] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#8B2635]/10 dark:bg-[#DC2626]/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-[#8B2635] dark:text-[#DC2626]">
                        {year.shortLabel}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-playfair text-lg font-medium text-[#2C1810] dark:text-[#FAF7F2]">
                        {year.name}
                      </h3>
                      <p className="text-sm text-[#8B7D6B] dark:text-[#78716C]">
                        Ordre: {year.order}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(year)}
                      className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#8B2635] dark:hover:text-[#DC2626] hover:bg-[#8B2635]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {deleteConfirm === year.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(year.id)}
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
                        onClick={() => setDeleteConfirm(year.id)}
                        className="p-2 text-[#8B7D6B] dark:text-[#78716C] hover:text-[#DC2626] dark:hover:text-[#F87171] hover:bg-[#DC2626]/10 dark:hover:bg-[#DC2626]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
