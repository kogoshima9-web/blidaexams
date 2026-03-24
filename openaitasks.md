# PDF to Quiz - Tasks & Milestones

## Project: PDF to Quiz v1.0

---

## Milestone 1: Project Setup & Infrastructure (M1)
**Target:** Complete foundation setup

### Tasks:
- [ ] T-001 Initialize Next.js project with App Router
- [ ] T-002 Install dependencies (Supabase client, Google AI SDK, drag-drop, etc.)
- [ ] T-003 Set up environment variables (.env.local) for API keys
- [ ] T-004 Configure Tailwind CSS with color scheme from PRD
- [ ] T-005 Create project folder structure
- [ ] T-006 Set up Supabase client configuration
- [ ] T-007 Verify empty Next.js app runs correctly

---

## Milestone 2: Database & Storage Setup (M2)
**Target:** Database tables and file storage ready

### Tasks:
- [ ] T-010 Create Supabase database schema (quizzes, questions, extraction_history tables)
- [ ] T-011 Set up Supabase Storage bucket for PDF files
- [ ] T-012 Create database connection helper functions
- [ ] T-013 Add Row Level Security (RLS) policies for tables
- [ ] T-014 Test database CRUD operations
- [ ] T-015 Verify file upload to Supabase Storage works

---

## Milestone 3: PDF Upload Module (M3)
**Target:** Admins can upload PDFs via all methods

### Tasks:
- [ ] T-020 Create drag & drop upload component
- [ ] T-021 Create file picker button component
- [ ] T-022 Integrate Google Drive API for file import
- [ ] T-023 Implement file validation (PDF only, size limit)
- [ ] T-024 Create upload progress indicator
- [ ] T-025 Handle multiple file queue display
- [ ] T-026 Connect upload to Supabase Storage
- [ ] T-027 Create upload page/layout in admin panel

---

## Milestone 4: AI Processing Module (M4)
**Target:** Gemini extracts questions from PDFs

### Tasks:
- [ ] T-030 Set up Gemini 2.5 Flash API client
- [ ] T-031 Create prompt template for question extraction
- [ ] T-032 Implement sequential file processing (one by one)
- [ ] T-033 Handle various question types parsing
- [ ] T-034 Create processing status indicators per file
- [ ] T-035 Implement error handling with retry option
- [ ] T-036 Create extraction API route (`/api/quiz/extract`)
- [ ] T-037 Test AI extraction with sample PDFs


---

## Milestone 5: Preview & Edit Module (M5)
**Target:** Admins can view and edit extracted questions

### Tasks:
- [ ] T-040 Create question list view component
- [ ] T-041 Create question edit form component
- [ ] T-042 Implement question text editing
- [ ] T-043 Implement answer options editing
- [ ] T-044 Implement correct answer marking
- [ ] T-045 Implement question deletion
- [ ] T-046 Implement drag & drop reordering
- [ ] T-047 Implement manual question addition
- [ ] T-048 Handle objective vs subjective question types
- [ ] T-049 Create preview page with split view layout

---

## Milestone 6: Save & Export Module (M6)
**Target:** Quizzes saved to database with export options

### Tasks:
- [ ] T-050 Create save quiz API route (`/api/quiz/save`)
- [ ] T-051 Implement quiz title/naming input
- [ ] T-052 Generate unique quiz ID handling
- [ ] T-053 Save questions to database
- [ ] T-054 Implement JSON export functionality
- [ ] T-055 Implement CSV export functionality
- [ ] T-056 Create success confirmation UI
- [ ] T-057 Create quiz list view (`/api/quiz/list`)

---

## Milestone 7: History & Re-process Module (M7)
**Target:** Admins can view past work and retry

### Tasks:
- [ ] T-060 Create extraction history API route (`/api/quiz/history`)
- [ ] T-061 Create history list UI component
- [ ] T-062 Display past extraction records
- [ ] T-063 Implement view past quiz functionality
- [ ] T-064 Create re-process API route (`/api/quiz/reprocess`)
- [ ] T-065 Add AI prompt/settings adjustment UI
- [ ] T-066 Connect re-process to extraction flow

---

## Milestone 8: Testing & Polish (M8)
**Target:** Feature complete and production-ready

### Tasks:
- [ ] T-070 Write unit tests for core functions
- [ ] T-071 Write integration tests for API routes
- [ ] T-072 Test with various PDF formats
- [ ] T-073 Performance testing (upload speed, extraction time)
- [ ] T-074 Error handling testing
- [ ] T-075 UI/UX review against PRD requirements
- [ ] T-076 Fix any bugs or issues found
- [ ] T-077 Verify success metrics targets
- [ ] T-078 Final code cleanup and documentation

---

## Quick Reference

| Milestone | Focus Area | Est. Tasks |
|-----------|------------|------------|
| M1 | Project Setup | 7 |
| M2 | Database | 6 |
| M3 | Upload Module | 8 |
| M4 | AI Processing | 8 |
| M5 | Preview & Edit | 10 |
| M6 | Save & Export | 8 |
| M7 | History & Re-process | 7 |
| M8 | Testing | 9 |
| **Total** | | **63** |

---

## Dependencies Map

```
M1 ──┬── M2
     │
     └── M3 ── M4 ── M5 ── M6
                   │
                   └── M7
                   │
                   └── M8
```

**Execution Order:** Complete M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8

---

## Notes

- M3 (Upload) can start after M2 (Storage) is partially ready
- M4 (AI) depends on M3 completion
- M5 (Preview) depends on M4 output format
- M6 (Save) depends on M5 final data
- M7 (History) can be built parallel to M6
- M8 should start after all functional tasks are done