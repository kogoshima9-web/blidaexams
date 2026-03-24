/**
 * DataService - Smart data fetching with API + localStorage fallback
 * 
 * Priority: API (Supabase) → localStorage (for offline/demo mode)
 */

import {
  schoolYearsStore,
  subjectsStore,
  examsStore,
  universitiesStore,
} from './store';
import type { SchoolYear, Subject, Exam, Question, University } from './types';

// ─── Types matching Supabase snake_case ───────────────────────────────

export interface DbSchoolYear {
  id: string;
  name: string;
  short_label: string;
  display_order: number;
}

export interface DbSubject {
  id: string;
  name: string;
  school_year_id: string;
  description?: string;
  icon?: string;
}

export interface DbQuestion {
  id: string;
  exam_id: string;
  question_order: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  image_url?: string;
  pdf_link?: string;
}

export interface DbExam {
  id: string;
  university: string;
  year: number;
  exam_type?: string;
  school_year_id: string;
  subject_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  subject?: DbSubject;
  school_year?: DbSchoolYear;
  questions?: DbQuestion[];
  questionCount?: number;
}

// ─── localStorage → camelCase conversion ─────────────────────────────

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj === null || typeof obj !== 'object') return obj;
  
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = toCamelCase(obj[key]);
  }
  return result;
}

// ─── API Fetch Helper ─────────────────────────────────────────────────

async function apiFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── School Years ─────────────────────────────────────────────────────

export async function getSchoolYears(): Promise<SchoolYear[]> {
  // Try API first
  const data = await apiFetch<DbSchoolYear[]>('/api/public/school-years');
  if (data && data.length > 0) {
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      shortLabel: d.short_label,
      order: d.display_order,
    }));
  }
  
  // Fallback to localStorage
  return schoolYearsStore.getAll();
}

// ─── Subjects ─────────────────────────────────────────────────────────

export async function getSubjects(schoolYearId?: string): Promise<Subject[]> {
  let resolvedId: string | undefined = schoolYearId;
  if (schoolYearId && !schoolYearId.includes('-')) {
    const years = await getSchoolYears();
    const found = years.find((y) => y.order === parseInt(schoolYearId) || y.shortLabel === schoolYearId);
    resolvedId = found?.id;
  }

  const url = resolvedId
    ? `/api/public/subjects?schoolYearId=${resolvedId}`
    : '/api/public/subjects';
  const data = await apiFetch<DbSubject[]>(url);
  if (data && data.length > 0) {
    const mapped = data.map((d) => ({
      id: d.id,
      name: d.name,
      schoolYearId: d.school_year_id,
      description: d.description,
    }));
    const seen = new Set<string>();
    return mapped.filter((subject) => {
      const key = `${subject.schoolYearId}-${subject.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  if (resolvedId) {
    return subjectsStore.getBySchoolYear(resolvedId);
  }
  return subjectsStore.getAll();
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((s) => s.id === id) || null;
}

// ─── Exams ─────────────────────────────────────────────────────────────

export async function getExams(subjectId?: string, schoolYearId?: string): Promise<Exam[]> {
  let resolvedYearId: string | undefined = schoolYearId;
  if (schoolYearId && !schoolYearId.includes('-')) {
    const years = await getSchoolYears();
    const found = years.find((y) => y.order === parseInt(schoolYearId) || y.shortLabel === schoolYearId);
    resolvedYearId = found?.id;
  }

  let url = '/api/public/exams?';
  if (subjectId) url += `subjectId=${subjectId}&`;
  if (resolvedYearId) url += `schoolYearId=${resolvedYearId}`;
  
  const data = await apiFetch<any[]>(url);
  if (data && data.length > 0) {
    return data.map((d) => ({
      id: d.id,
      university: d.university,
      year: d.year,
      examType: d.exam_type,
      schoolYearId: d.school_year_id,
      subjectId: d.subject_id,
      isPublished: d.is_published,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      originalPdfUrl: d.original_pdf_url,
      questions: (d.questions || []).map((q: any) => ({
        id: q.id,
        examId: q.exam_id,
        text: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
        correctAnswers: q.correct_answers || [q.correct_answer],
        imageUrl: q.image_url,
        pdfLink: q.pdf_link,
        order: q.question_order,
      })),
      questionCount: d.questionCount,
      subject: d.subject ? {
        id: d.subject.id,
        name: d.subject.name,
        schoolYearId: d.subject.school_year_id,
        description: d.subject.description,
      } : undefined,
    }));
  }
  
  // Fallback to localStorage
  let exams = examsStore.getAll().filter((e) => e.isPublished);
  if (subjectId) exams = exams.filter((e) => e.subjectId === subjectId);
  if (schoolYearId) exams = exams.filter((e) => e.schoolYearId === schoolYearId);
  return exams;
}

export async function getExamById(id: string): Promise<Exam | null> {
  // Try API first
  const data = await apiFetch<any>(`/api/public/exams/${id}`);
  if (data && !data.error) {
    return {
      id: data.id,
      university: data.university,
      year: data.year,
      examType: data.exam_type,
      schoolYearId: data.school_year_id,
      subjectId: data.subject_id,
      isPublished: data.is_published,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      originalPdfUrl: data.original_pdf_url,
      questions: (data.questions || []).map((q: any) => {
        let ca = q.correct_answer;
        const caText = q.correct_answers;
        if (Array.isArray(caText)) {
          ca = caText;
        } else if (caText && typeof caText === 'string' && caText.startsWith('{')) {
          ca = caText.slice(1, -1).split(',').map(Number);
        } else if (typeof ca === 'string' && ca.includes(',')) {
          ca = ca.split(',').map(Number);
        } else {
          ca = [Number(ca)];
        }
        const isArray = Array.isArray(ca);
        return {
          id: q.id,
          examId: q.exam_id,
          text: q.question_text,
          options: q.options,
          correctAnswer: isArray ? ca[0] : ca,
          correctAnswers: isArray ? ca : [ca],
          imageUrl: q.image_url,
          pdfLink: q.pdf_link,
          order: q.question_order,
        };
      }),
      subject: data.subject ? {
        id: data.subject.id,
        name: data.subject.name,
        schoolYearId: data.subject.school_year_id,
        description: data.subject.description,
      } : undefined,
    };
  }
  
  // Fallback to localStorage
  return examsStore.getById(id);
}

export async function getUniversities(): Promise<University[]> {
  const data = await apiFetch<any[]>('/api/public/universities');
  if (data && data.length > 0) {
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      city: d.city,
      order: d.display_order,
    }));
  }
  return universitiesStore.getAll();
}

// ─── Question Reports ───────────────────────────────────────────────────

export interface QuestionReport {
  id: string;
  questionId: string;
  examId: string;
  reportType: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export async function submitReport(
  questionId: string,
  examId: string,
  reportType: string,
  description: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, examId, reportType, description }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
