-- Add multi-answer support to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answers INTEGER[];
