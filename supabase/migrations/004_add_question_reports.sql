-- Create the reports table (if not exists)
CREATE TABLE IF NOT EXISTS question_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'incorrect_answer',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies (drop existing first to avoid conflict)
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read question reports" ON question_reports;
DROP POLICY IF EXISTS "Public can insert question reports" ON question_reports;
DROP POLICY IF EXISTS "Service role can update question reports" ON question_reports;
DROP POLICY IF EXISTS "Service role can delete question reports" ON question_reports;

CREATE POLICY "Public can read question reports" ON question_reports FOR SELECT USING (true);
CREATE POLICY "Public can insert question reports" ON question_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update question reports" ON question_reports FOR UPDATE USING (true);
CREATE POLICY "Service role can delete question reports" ON question_reports FOR DELETE USING (true);
