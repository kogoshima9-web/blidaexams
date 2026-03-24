export interface University {
  id: string;
  name: string;
  city: string;
  order: number;
}

export interface SchoolYear {
  id: string;
  name: string;
  shortLabel: string;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
  schoolYearId: string;
  description?: string;
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  correctAnswers?: number[];
  imageUrl?: string;
  pdfLink?: string;
  order: number;
}

export interface Exam {
  id: string;
  university: string;
  year: number;
  examType?: string;
  schoolYearId: string;
  subjectId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  subject?: Subject;
  questionCount?: number;
  originalPdfUrl?: string;
}

export interface ExamWithDetails extends Exam {
  schoolYear?: SchoolYear;
  subject?: Subject;
}
