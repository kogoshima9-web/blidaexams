'use client';

import React, { useState } from 'react';
import { 
  Check, X, Plus, Trash2, GripVertical, Save, Download,
  ChevronDown, ChevronRight, FileQuestion, CheckCircle2, AlertCircle
} from 'lucide-react';
import { ExtractedQuestion } from '@/lib/geminiService';

interface QuestionPreviewProps {
  questions: ExtractedQuestion[];
  onQuestionsChange?: (questions: ExtractedQuestion[]) => void;
  onSave?: (questions: ExtractedQuestion[]) => void;
  onExport?: (format: 'json' | 'csv') => void;
}

export default function QuestionPreview({ 
  questions: initialQuestions, 
  onQuestionsChange,
  onSave,
  onExport 
}: QuestionPreviewProps) {
  const [questions, setQuestions] = useState<ExtractedQuestion[]>(initialQuestions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const updateQuestion = (index: number, updates: Partial<ExtractedQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
    onQuestionsChange?.(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    onQuestionsChange?.(newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: ExtractedQuestion = {
      questionText: '',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      questionType: 'multiple_choice',
      answerSource: 'pdf',
    };
    setQuestions([...questions, newQuestion]);
    onQuestionsChange?.([...questions, newQuestion]);
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Multiple Choice';
      case 'multiple_select': return 'Multiple Select';
      case 'true_false': return 'True/False';
      case 'short_answer': return 'Short Answer';
      case 'essay': return 'Essay';
      default: return type;
    }
  };

  const getSourceBadge = (source: 'pdf' | 'ai_solved') => {
    if (source === 'pdf') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <FileQuestion className="w-3 h-3" />
          From PDF
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <AlertCircle className="w-3 h-3" />
        AI Solved
      </span>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Questions Preview
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {questions.length} question{questions.length !== 1 ? 's' : ''} extracted
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport?.('json')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 
              bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => onExport?.('csv')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 
              bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => onSave?.(questions)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
              bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Quiz
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Question Header */}
            <div 
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2">
                  {question.questionText || <span className="text-slate-400 italic">Empty question</span>}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getSourceBadge(question.answerSource)}
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {getQuestionTypeLabel(question.questionType)}
                </span>
                {expandedQuestions.has(index) ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedQuestions.has(index) && (
              <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-700">
                {/* Question Text Edit */}
                <div className="pt-4">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 
                      bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter question text..."
                  />
                </div>

                {/* Options (for choice questions) */}
                {question.questionType !== 'essay' && question.questionType !== 'short_answer' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (question.questionType === 'multiple_select') {
                                const current = Array.isArray(question.correctAnswer) 
                                  ? question.correctAnswer 
                                  : [];
                                const newCorrect = current.includes(optIndex)
                                  ? current.filter((i) => i !== optIndex)
                                  : [...current, optIndex];
                                updateQuestion(index, { correctAnswer: newCorrect });
                              } else {
                                updateQuestion(index, { correctAnswer: optIndex });
                              }
                            }}
                            className={`
                              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                              ${Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.includes(optIndex)
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                                : question.correctAnswer === optIndex
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                              }
                            `}
                          >
                            {(Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer.includes(optIndex)
                              : question.correctAnswer === optIndex) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])];
                              newOptions[optIndex] = e.target.value;
                              updateQuestion(index, { options: newOptions });
                            }}
                            className="flex-1 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 
                              bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-600
                              focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          />
                          <button
                            onClick={() => {
                              const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                              // Adjust correct answer if needed
                              let newCorrect = question.correctAnswer;
                              if (typeof newCorrect === 'number' && newCorrect >= optIndex) {
                                newCorrect = Math.max(0, newCorrect - 1);
                              } else if (Array.isArray(newCorrect)) {
                                newCorrect = newCorrect.filter((i) => i !== optIndex).map((i) => 
                                  i > optIndex ? i - 1 : i
                                );
                              }
                              updateQuestion(index, { options: newOptions, correctAnswer: newCorrect });
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add Option Button */}
                      <button
                        onClick={() => {
                          const newOptions = [...(question.options || []), `Option ${String.fromCharCode(65 + (question.options?.length || 0))}`];
                          updateQuestion(index, { options: newOptions });
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 dark:text-blue-400 
                          hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Question Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Question Type
                  </label>
                  <select
                    value={question.questionType}
                    onChange={(e) => updateQuestion(index, { questionType: e.target.value as any })}
                    className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 
                      bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="multiple_select">Multiple Select</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                {/* Answer Source */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Answer Source
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateQuestion(index, { answerSource: 'pdf' })}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        question.answerSource === 'pdf'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-green-400'
                      }`}
                    >
                      From PDF
                    </button>
                    <button
                      onClick={() => updateQuestion(index, { answerSource: 'ai_solved' })}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        question.answerSource === 'ai_solved'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      AI Solved
                    </button>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 
                      bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-600
                      focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Add explanation or notes..."
                  />
                </div>

                {/* Delete Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => deleteQuestion(index)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Question
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <button
        onClick={addQuestion}
        className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg
          text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400
          hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add New Question
      </button>
    </div>
  );
}