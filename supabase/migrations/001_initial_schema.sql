-- ============================================
-- Blida Exams Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS school_years CASCADE;

-- ============================================
-- SCHOOL YEARS
-- ============================================
CREATE TABLE school_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBJECTS
-- ============================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  school_year_id UUID NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  description TEXT,
  icon TEXT DEFAULT 'book',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXAMS
-- ============================================
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university TEXT NOT NULL DEFAULT 'Université de Constantine',
  year INTEGER NOT NULL,
  exam_type TEXT DEFAULT 'EMD',
  school_year_id UUID NOT NULL REFERENCES school_years(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL DEFAULT 0,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  pdf_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_subjects_school_year ON subjects(school_year_id);
CREATE INDEX idx_exams_school_year ON exams(school_year_id);
CREATE INDEX idx_exams_subject ON exams(subject_id);
CREATE INDEX idx_exams_published ON exams(is_published) WHERE is_published = true;
CREATE INDEX idx_questions_exam ON questions(exam_id);

-- ============================================
-- Row Level Security (RLS) - allows public read
-- ============================================
ALTER TABLE school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Public read access (students can browse)
CREATE POLICY "Public can read school years" ON school_years FOR SELECT USING (true);
CREATE POLICY "Public can read subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public can read published exams" ON exams FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read questions for published exams" ON questions FOR SELECT USING (
  exam_id IN (SELECT id FROM exams WHERE is_published = true)
);

-- Admin write access (through service role - we'll handle auth in API)
CREATE POLICY "Service role can insert school years" ON school_years FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update school years" ON school_years FOR UPDATE USING (true);
CREATE POLICY "Service role can delete school years" ON school_years FOR DELETE USING (true);
CREATE POLICY "Service role can insert subjects" ON subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update subjects" ON subjects FOR UPDATE USING (true);
CREATE POLICY "Service role can delete subjects" ON subjects FOR DELETE USING (true);
CREATE POLICY "Service role can insert exams" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update exams" ON exams FOR UPDATE USING (true);
CREATE POLICY "Service role can delete exams" ON exams FOR DELETE USING (true);
CREATE POLICY "Service role can insert questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update questions" ON questions FOR UPDATE USING (true);
CREATE POLICY "Service role can delete questions" ON questions FOR DELETE USING (true);

-- ============================================
-- SEED DATA: School Years
-- ============================================
INSERT INTO school_years (name, short_label, display_order) VALUES
  ('1ère Année', '1ère', 1),
  ('2ème Année', '2ème', 2),
  ('3ème Année', '3ème', 3),
  ('4ème Année', '4ème', 4),
  ('5ème Année', '5ème', 5),
  ('6ème Année', '6ème', 6),
  ('7ème Année', '7ème', 7);

-- ============================================
-- SEED DATA: Subjects for 3ème année
-- ============================================
INSERT INTO subjects (name, school_year_id, description) VALUES
  ('Microbiologie', (SELECT id FROM school_years WHERE short_label = '3ème'), 'Agents pathogènes : bactériologie, virologie, mycologie, parasitologie'),
  ('Pathologie', (SELECT id FROM school_years WHERE short_label = '3ème'), 'Étude des maladies et mécanismes pathologiques'),
  ('Pharmacologie', (SELECT id FROM school_years WHERE short_label = '3ème'), 'Médicaments, pharmacocinétique, pharmacodynamie');
