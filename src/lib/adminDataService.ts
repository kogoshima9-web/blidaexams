import {
  schoolYearsStore,
  subjectsStore,
  examsStore,
  universitiesStore,
} from './store';
import type { SchoolYear, Subject, Exam, University } from './types';

async function adminFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAdminSchoolYears(): Promise<SchoolYear[]> {
  const data = await adminFetch<any[]>('/api/school-years');
  if (data && data.length > 0) {
    return data.map((d) => ({
      id: d.id,
      name: d.name,
      shortLabel: d.short_label,
      order: d.display_order,
    }));
  }
  return schoolYearsStore.getAll();
}

export async function getAdminSubjects(): Promise<Subject[]> {
  const data = await adminFetch<any[]>('/api/subjects');
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
  return subjectsStore.getAll();
}

export async function getAdminExams(filters?: {
  status?: string;
  schoolYearId?: string;
  subjectId?: string;
}): Promise<Exam[]> {
  let url = '/api/exams?';
  if (filters?.status) url += `status=${filters.status}&`;
  if (filters?.schoolYearId) url += `schoolYearId=${filters.schoolYearId}&`;
  if (filters?.subjectId) url += `subjectId=${filters.subjectId}&`;

  const data = await adminFetch<any[]>(url);
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
      questions: (d.questions || []).map((q: any) => {
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
      subject: d.subject,
      schoolYear: d.school_year,
    }));
  }

  let exams = examsStore.getAll();
  if (filters?.status === 'published') exams = exams.filter((e) => e.isPublished);
  if (filters?.status === 'draft') exams = exams.filter((e) => !e.isPublished);
  if (filters?.schoolYearId) exams = exams.filter((e) => e.schoolYearId === filters.schoolYearId);
  if (filters?.subjectId) exams = exams.filter((e) => e.subjectId === filters.subjectId);
  return exams;
}

export async function createAdminExam(data: {
  university: string;
  year: number;
  schoolYearId: string;
  subjectId: string;
  isPublished: boolean;
  questions: any[];
}): Promise<Exam | null> {
  const result = await adminFetch<any>('/api/exams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result;
}

export async function updateAdminExam(id: string, data: any): Promise<Exam | null> {
  const result = await adminFetch<any>(`/api/exams`, {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
  return result;
}

export async function deleteAdminExam(id: string): Promise<boolean> {
  const result = await adminFetch<any>(`/api/exams?id=${id}`, {
    method: 'DELETE',
  });
  return result?.success === true;
}

export async function getAdminStats() {
  const exams = await getAdminExams();
  const questions = exams.flatMap((e) => e.questions || []);
  return {
    totalExams: exams.length,
    totalQuestions: questions.length,
    publishedExams: exams.filter((e) => e.isPublished).length,
    draftExams: exams.filter((e) => !e.isPublished).length,
  };
}

export async function createAdminSchoolYear(
  data: { name: string; shortLabel: string; order: number }
): Promise<SchoolYear | null> {
  const result = await adminFetch<any>('/api/school-years', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result) {
    return {
      id: result.id,
      name: result.name,
      shortLabel: result.short_label,
      order: result.display_order,
    };
  }
  return null;
}

export async function updateAdminSchoolYear(
  id: string,
  data: { name?: string; shortLabel?: string; order?: number }
): Promise<SchoolYear | null> {
  const result = await adminFetch<any>('/api/school-years', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
  if (result) {
    return {
      id: result.id,
      name: result.name,
      shortLabel: result.short_label,
      order: result.display_order,
    };
  }
  return null;
}

export async function deleteAdminSchoolYear(id: string): Promise<boolean> {
  const result = await adminFetch<any>(`/api/school-years?id=${id}`, { method: 'DELETE' });
  return result?.success === true;
}

export async function createAdminSubject(
  data: { name: string; schoolYearId: string; description?: string; icon?: string }
): Promise<Subject | null> {
  const result = await adminFetch<any>('/api/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result) {
    return {
      id: result.id,
      name: result.name,
      schoolYearId: result.school_year_id,
      description: result.description,
    };
  }
  return null;
}

export async function updateAdminSubject(
  id: string,
  data: { name?: string; schoolYearId?: string; description?: string }
): Promise<Subject | null> {
  const result = await adminFetch<any>('/api/subjects', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
  if (result) {
    return {
      id: result.id,
      name: result.name,
      schoolYearId: result.school_year_id,
      description: result.description,
    };
  }
  return null;
}

export async function deleteAdminSubject(id: string): Promise<boolean> {
  const result = await adminFetch<any>(`/api/subjects?id=${id}`, { method: 'DELETE' });
  return result?.success === true;
}

export async function getAdminUniversities(): Promise<University[]> {
  const data = await adminFetch<any[]>('/api/universities');
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

export async function createAdminUniversity(
  data: { name: string; city: string; order: number }
): Promise<University | null> {
  const result = await adminFetch<any>('/api/universities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (result) {
    return {
      id: result.id,
      name: result.name,
      city: result.city,
      order: result.display_order,
    };
  }
  return null;
}

export async function updateAdminUniversity(
  id: string,
  data: { name?: string; city?: string; order?: number }
): Promise<University | null> {
  const result = await adminFetch<any>('/api/universities', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  });
  if (result) {
    return {
      id: result.id,
      name: result.name,
      city: result.city,
      order: result.display_order,
    };
  }
  return null;
}

export async function deleteAdminUniversity(id: string): Promise<boolean> {
  const result = await adminFetch<any>(`/api/universities?id=${id}`, { method: "DELETE" });
  return result?.success === true;
}

export interface BackupData {
  version: string;
  createdAt: string;
  exams: any[];
  subjects: any[];
  schoolYears: any[];
  universities: any[];
}

export async function exportBackup(): Promise<BackupData | null> {
  return adminFetch<BackupData>("/api/backup");
}

export async function importBackup(data: BackupData): Promise<{ success: boolean; results?: any } | null> {
  const result = await adminFetch<{ success: boolean; results?: any }>("/api/backup", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result;
}
