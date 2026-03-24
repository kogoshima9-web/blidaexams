# PDF to Quiz - Product Requirements Document

## Project Overview

**Project Name:** PDF to Quiz  
**Version:** 1.0  
**Date:** March 23, 2026  
**Status:** Draft

---

## 1. Executive Summary

PDF to Quiz is an AI-powered admin panel feature that extracts exam questions from scanned PDF files using Gemini 2.5 Flash and converts them into editable, storable quiz questions. Admins upload PDF exams, the AI processes them (one by one to avoid messiness), and produces a structured quiz that can be reviewed, edited, and saved to the Supabase database.

---

## 2. User Stories

| ID | User Story |
|----|------------|
| US1 | As an admin, I want to upload a scanned PDF exam via drag & drop, file picker, or Google Drive so that I can start the extraction process. |
| US2 | As an admin, I want the AI to process multiple PDFs one by one so that the results remain organized and accurate. |
| US3 | As an admin, I want to preview extracted questions before saving so that I can verify accuracy. |
| US4 | As an admin, I want to edit, delete, and reorder questions in the preview so that I can refine the quiz. |
| US5 | As an admin, I want to manually add new questions after AI extraction so that I can fill any gaps. |
| US6 | As an admin, I want to save the final quiz to the Supabase database so that it can be used later. |
| US7 | As an admin, I want to retry the AI extraction with different settings if the results are unsatisfactory. |
| US8 | As an admin, I want to view a history of past extractions so that I can reference previous work. |

---

## 3. Functional Requirements

### 3.1 PDF Upload Module
- **FR-01:** Support file picker selection for PDF files
- **FR-02:** Support drag & drop zone for PDF files
- **FR-03:** Support Google Drive integration for importing PDFs
- **FR-04:** Allow uploading multiple PDFs at once
- **FR-05:** Display upload progress indicator
- **FR-06:** Validate file type (PDF only) before upload

### 3.2 AI Processing Module
- **FR-07:** Use Gemini 2.5 Flash API for question extraction
- **FR-08:** Process multiple files sequentially (one by one) to maintain quality
- **FR-09:** Handle various question types found in PDF (multiple choice, multiple select, short answer, essay, true/false, fill-in-the-blank)
- **FR-10:** Extract question text, options (if applicable), correct answer(s), and explanation
- **FR-11:** Show processing status per file
- **FR-12:** Handle API errors gracefully with retry option
- **FR-12a:** AI must prioritize extracting answers FROM the PDF exam (typically on last slide/pages)
- **FR-12b:** If PDF contains answer key/solutions, extract and map them to respective questions
- **FR-12c:** If PDF has NO answers, AI may solve questions but MUST mark them as "AI Solved" with visual indicator
- **FR-12d:** Display clear distinction between "PDF Extracted Answers" vs "AI Solved" questions

### 3.3 Preview & Edit Module
- **FR-13:** Display extracted questions in a structured list view
- **FR-14:** Allow editing question text
- **FR-15:** Allow editing answer options
- **FR-16:** Allow marking correct answers
- **FR-17:** Allow deleting individual questions
- **FR-18:** Allow reordering questions (drag & drop)
- **FR-19:** Allow adding new questions manually
- **FR-20:** Support both objective (instant grading) and subjective (manual grading) question types
- **FR-20a:** Display "AI Solved" badge on questions where AI provided answers (no PDF answers found)
- **FR-20b:** Display "From PDF" badge on questions where answers were extracted from exam
- **FR-20c:** Allow admin to override AI-solved to manually add correct answer

### 3.4 Save & Export Module
- **FR-21:** Save quiz to EXISTING Supabase database (use existing exams and questions tables)
- **FR-22:** Generate unique quiz ID
- **FR-23:** Allow naming the quiz before saving
- **FR-24:** Map extracted questions to existing questions table structure
- **FR-25:** Link quiz to existing subjects/school_years via exams table
- **FR-26:** Add "answer_source" field to track if answer is from PDF or AI solved
- **FR-27:** Backup button on admin panel to export all quiz data as JSON/CSV
- **FR-28:** Support full database backup with all exams, questions, and metadata

### 3.5 History Module
- **FR-26:** Store extraction history with timestamp
- **FR-27:** Display list of past extractions
- **FR-28:** Allow viewing past extracted quizzes
- **FR-29:** Allow re-processing past files

### 3.6 Re-process Module
- **FR-30:** Allow re-running AI extraction on same PDF
- **FR-31:** Allow adjusting AI prompt/settings before re-processing

### 3.7 Backup Module (Admin Panel)
- **FR-32:** "Backup" button prominently displayed on admin panel header/ toolbar
- **FR-33:** Export all quizzes (exams + questions) as JSON file download
- **FR-34:** Export all quizzes as CSV file for spreadsheet use
- **FR-35:** Include answer_source metadata in backup (PDF vs AI solved)
- **FR-36:** Show last backup timestamp on admin panel
- **FR-37:** One-click full database backup functionality

---

## 4. Technical Architecture

### 4.1 Tech Stack
- **Frontend:** Next.js (App Router)
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Gemini 2.5 Flash via Google AI API
- **File Storage:** Supabase Storage (for uploaded PDFs)
- **UI Components:** Custom components with Tailwind CSS

### 4.2 Database Schema

**IMPORTANT:** Integrate with EXISTING database tables. DO NOT create new tables - use existing schema.

```sql
-- EXISTING TABLES (from 001_initial_schema.sql)

-- subjects table - link quiz to subject
-- school_years table - link quiz to school year

-- exams table - stores the quiz/exam
-- exams has: id, university, year, exam_type, school_year_id, subject_id, is_published

-- questions table - stores individual questions
-- questions has: id, exam_id, question_order, question_text, options (JSONB), correct_answer, image_url, pdf_link

-- ============================================
-- REQUIRED MIGRATION: Add answer_source field
-- ============================================
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer_source TEXT DEFAULT 'pdf';
-- Values: 'pdf' = answer from PDF exam, 'ai_solved' = AI solved (no PDF answer found)

-- ============================================
-- Extraction History table (NEW - track AI extractions)
-- ============================================
CREATE TABLE IF NOT EXISTS extraction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  extracted_at TIMESTAMPTZ,
  exam_id UUID REFERENCES exams(id),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for extraction history
CREATE INDEX IF NOT EXISTS idx_extraction_history_created ON extraction_history(created_at DESC);
```

### 4.3 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quiz/upload` | POST | Handle PDF file upload |
| `/api/quiz/extract` | POST | Trigger AI extraction |
| `/api/quiz/preview` | GET | Get preview of extracted questions |
| `/api/quiz/save` | POST | Save quiz to database |
| `/api/quiz/list` | GET | List all quizzes |
| `/api/quiz/history` | GET | Get extraction history |
| `/api/quiz/reprocess` | POST | Re-process a PDF |

---

## 5. UI/UX Requirements

### 5.1 Admin Dashboard Layout
- **Header:** Logo, navigation, user profile
- **Main Area:** Upload zone, quiz list, or extraction interface
- **Sidebar:** Quick access to history, settings

### 5.2 Upload Interface
- Large drop zone with icon
- File picker button
- Google Drive connect button
- Progress bar during upload
- Queue display for multiple files

### 5.3 Preview Interface
- Split view: question list on left, edit form on right
- Question card showing type indicator
- Inline editing capability
- Drag handles for reordering
- "Add Question" button

### 5.4 Color Scheme
- Primary: Blue (#2563EB)
- Secondary: Slate (#64748B)
- Success: Green (#16A34A)
- Error: Red (#DC2626)
- Background: Light gray (#F8FAFC)

---

## 6. Non-Functional Requirements

### 6.1 Performance
- PDF upload should complete within 10 seconds for files under 10MB
- AI extraction should complete within 30 seconds per file
- UI should remain responsive during processing (loading states)

### 6.2 Security
- API keys stored in environment variables
- File uploads validated and sanitized
- User authentication required for all actions

### 6.3 Scalability
- Support up to 50 PDFs in a single batch upload
- Handle concurrent extraction requests efficiently

---

## 7. Out of Scope (v1.0)

- Student-facing quiz taking interface
- Real-time collaboration
- AI model fine-tuning
- PDF OCR preprocessing (relying on Gemini's vision capabilities)

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Question extraction accuracy | >85% for clear PDFs |
| Admin satisfaction score | >4/5 |
| Average time from upload to saved quiz | <2 minutes |
| System uptime | 99.5% |

---

## 9. Future Enhancements (v2.0)

- Student quiz taking interface
- Auto-grading for essays using AI
- Quiz analytics and insights
- Bulk export to LMS formats (QTI, CSV)
- Template-based question banks
- Multi-language support