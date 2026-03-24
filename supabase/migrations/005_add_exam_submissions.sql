-- Exam Submissions table - allows users to submit exams (files + info) to admins
CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  exam_year INTEGER,
  exam_university TEXT,
  exam_type TEXT,
  notes TEXT,
  file_urls TEXT[], -- Array of file URLs (PDFs, images)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exam_submissions_status ON exam_submissions(status);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_created_at ON exam_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert on exam_submissions"
  ON exam_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users full access (admin panel)
CREATE POLICY "Allow authenticated full access exam_submissions"
  ON exam_submissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
