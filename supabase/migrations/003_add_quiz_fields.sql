-- ============================================
-- Migration: Add answer_source and extraction_history
-- ============================================

-- Add answer_source field to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer_source TEXT DEFAULT 'pdf';
-- Values: 'pdf' = answer from PDF exam, 'ai_solved' = AI solved (no PDF answer found)

-- Add question_type field
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
-- Values: 'multiple_choice', 'multiple_select', 'true_false', 'short_answer', 'essay'

-- Add explanation field
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- ============================================
-- Extraction History table
-- ============================================
CREATE TABLE IF NOT EXISTS extraction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extracted_at TIMESTAMPTZ,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  error_message TEXT,
  questions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for extraction history
CREATE INDEX IF NOT EXISTS idx_extraction_history_created ON extraction_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extraction_history_status ON extraction_history(status);

-- Enable RLS on extraction_history
ALTER TABLE extraction_history ENABLE ROW LEVEL SECURITY;

-- Allow public read for history
CREATE POLICY "Public can read extraction history" ON extraction_history FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role can manage extraction history" ON extraction_history FOR ALL USING (true);