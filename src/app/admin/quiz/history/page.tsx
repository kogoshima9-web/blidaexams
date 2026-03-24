'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, RefreshCw, Trash2, Eye, ChevronRight, 
  FileText, CheckCircle, AlertCircle, Loader2, Calendar
} from 'lucide-react';

interface HistoryRecord {
  id: string;
  file_name: string;
  file_url?: string;
  status: string;
  extracted_at?: string;
  error_message?: string;
  questions_count: number;
  created_at: string;
  exam?: {
    id: string;
    university: string;
    year: number;
    exam_type: string;
  };
  subject?: {
    name: string;
  };
}

export default function ExtractionHistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/quiz/history');
      const result = await response.json();
      if (result.success) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const response = await fetch(`/api/quiz/history?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            <Loader2 className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Extraction History
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                View past PDF to Quiz extractions
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 
              bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700
              hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
              No extraction history yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Your PDF extraction records will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {record.file_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.created_at)}
                      </span>
                      {record.questions_count > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {record.questions_count} questions
                        </span>
                      )}
                    </div>
                  </div>

                  {getStatusBadge(record.status)}

                  <div className="flex items-center gap-2">
                    {record.exam && (
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 
                          hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Exam"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 
                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {record.error_message && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                      {record.error_message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Extraction Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    File Name
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {selectedRecord.file_name}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Questions Extracted
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    {selectedRecord.questions_count}
                  </p>
                </div>
                
                {selectedRecord.exam && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Saved Exam
                    </label>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {selectedRecord.exam.exam_type} - {selectedRecord.exam.year}
                    </p>
                  </div>
                )}
                
                {selectedRecord.extracted_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Extracted At
                    </label>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {formatDate(selectedRecord.extracted_at)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 
                    bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}