"use client";

import { useEffect, useState } from "react";
import { 
  Download, 
  Eye, 
  Check, 
  X, 
  FileText, 
  Image, 
  Loader2,
  ExternalLink,
  Inbox,
  Filter
} from "lucide-react";

interface ExamSubmission {
  id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  exam_year: number | null;
  exam_university: string | null;
  exam_type: string | null;
  notes: string | null;
  file_urls: string[] | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ExamSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/exam-submissions");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/exam-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) {
        setSubmissions(submissions.map(s => 
          s.id === id ? { ...s, status, admin_notes: adminNotes || null } : s
        ));
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredSubmissions = submissions.filter(s => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const getFileIcon = (url: string) => {
    const ext = url.toLowerCase().split(".").pop();
    if (ext === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
    return <Image className="w-4 h-4 text-blue-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels: Record<string, string> = {
      pending: "En attente",
      reviewed: "Examiné",
      accepted: "Accepté",
      rejected: "Rejeté",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Examens Envoyés
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {submissions.length} soumission{submissions.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="reviewed">Examinés</option>
            <option value="accepted">Acceptés</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-20">
          <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Aucune soumission trouvée
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Université
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Année
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fichiers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {submission.exam_university || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {submission.exam_year || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {submission.file_urls && submission.file_urls.length > 0 ? (
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          {submission.file_urls.length} fichier{submission.file_urls.length !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Détails de la soumission
                </h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Soumis par
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {selectedSubmission.user_name || "Anonyme"}
                  </p>
                  {selectedSubmission.user_email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedSubmission.user_email}
                    </p>
                  )}
                  {selectedSubmission.user_phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedSubmission.user_phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date de soumission
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(selectedSubmission.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Université
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {selectedSubmission.exam_university || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Année
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {selectedSubmission.exam_year || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1 capitalize">
                    {selectedSubmission.exam_type || "—"}
                  </p>
                </div>
              </div>

              {selectedSubmission.notes && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notes
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                    {selectedSubmission.notes}
                  </p>
                </div>
              )}

              {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fichiers joints
                  </label>
                  <div className="mt-2 space-y-2">
                    {selectedSubmission.file_urls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getFileIcon(url)}
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            Fichier {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <a
                            href={url}
                            download
                            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                Modifier le statut
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(selectedSubmission.id, "pending")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSubmission.status === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                  }`}
                >
                  En attente
                </button>
                <button
                  onClick={() => updateStatus(selectedSubmission.id, "reviewed")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSubmission.status === "reviewed"
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  }`}
                >
                  Examiné
                </button>
                <button
                  onClick={() => updateStatus(selectedSubmission.id, "accepted")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSubmission.status === "accepted"
                      ? "bg-green-500 text-white"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                  }`}
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Accepter
                </button>
                <button
                  onClick={() => updateStatus(selectedSubmission.id, "rejected")}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedSubmission.status === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  }`}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
