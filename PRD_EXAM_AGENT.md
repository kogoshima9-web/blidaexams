# Blida Exams — Exam Extraction Agent PRD

## 1. Overview

**What it does:** An automated agent that takes a PDF of a medical exam, extracts all QCM questions with their options and correct answers, then uploads the exam directly to the Blida Exams Supabase database.

**Who uses it:** The admin (you) — you give it a PDF URL or file, it does the rest, asks for your approval at key steps.

---

## 2. Tech Stack

- **Python** — PDF → JPEG image conversion (PyMuPDF + Pillow)
- **Gemini 2.5 Flash** — OCR + question extraction + answer reading from correction key
- **Node.js** — Supabase database uploads
- **Supabase** — PostgreSQL database for storing exams and questions

---

## 3. Multi-Answer Support

Some Algerian medical QCM exams have **multiple correct answers** (e.g., "AD", "BCE", "ABC").

### Database Schema
```sql
-- questions table has:
correct_answer_index  INTEGER   -- index of first correct answer (0=a, 1=b, 2=c, 3=d, 4=e)
correct_answers       TEXT[]   -- ARRAY of indices for ALL correct answers, e.g. {0,3} for "AD"
```

### Scoring Logic
When a student answers:
1. Compare selected option(s) against `correct_answers` array
2. Award **full marks** only if **all** correct answers are selected and **no** wrong answers are selected
3. Award **partial credit** proportionally (e.g., selecting 2/3 correct answers with no wrong = 2/3 points)
4. Award **zero** if any wrong answer is selected

### Visual Indicator
- When showing correct answers (review mode), display **all** correct options highlighted
- Each correct option gets a ✓ icon
- Never hide any correct answer from the student in review mode

---

## 4. Workflow (Step-by-Step)

### Step 1 — Receive PDF
- User provides: PDF URL or local file path
- Agent downloads the PDF

### Step 2 — Convert PDF to Images
- Convert each PDF page to JPEG (quality=65, scale=1.5x)
- Save base64-encoded images to `pages.json`
- Output: `pages.json` — array of base64 JPEG strings

### Step 3 — Gemini: Extract Questions
- Send **pages 1 to N-1** (all except correction page) to Gemini 2.5 Flash
- Prompt: extract all QCM questions in JSON
- Gemini returns: question number, text, and options array

```json
{
  "exam_info": {"university":"...","year":2023,"exam_type":"EMD","subject":"..."},
  "questions": [
    {"number":1,"text":"...","options":["A","B","C","D","E"]}
  ]
}
```

### Step 4 — Gemini: Extract Correct Answers
- Send **last page(s)** (correction key / Corrigé Type) to Gemini 2.5 Flash
- Prompt: extract answers in JSON

```json
{
  "answers": [
    {"number":1,"correct_answer":"AD"},
    {"number":2,"correct_answer":"E"}
  ]
}
```

> **Note:** Gemini returns answers as letter strings like "AD", "E", "BD" — these are multi-answer strings, NOT single indices.

### Step 5 — Parse & Normalize
- For each question, parse `correct_answer` from the answer extraction:
  - Split string: "AD" → ["A", "D"]
  - Map to indices: ["A", "D"] → [0, 3]
  - Set `correct_answer_index` = first index (for single-answer fallback)
  - Set `correct_answers` = full array (e.g., [0, 3])

### Step 6 — Preview & User Approval
- Show user a preview of the extracted exam:
  - Number of questions
  - First 3 questions with their options and correct answers
  - Any flagged issues (missing options, incomplete text, etc.)
- **WAIT for user approval** before uploading

### Step 7 — Upload to Supabase
- Insert exam into `exams` table
- Insert all questions into `questions` table (including `correct_answer_index` and `correct_answers`)
- Return exam URL

---

## 5. Required Environment Variables

```
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## 6. Example Usage

```bash
# Run the agent
node exam_agent.mjs --url "https://univ.ency-education.com/uploads/.../exam.pdf"
# OR
node exam_agent.mjs --file "path/to/exam.pdf"
```

The agent will:
1. Download/load the PDF
2. Convert to images
3. Extract questions with Gemini
4. Extract answers with Gemini
5. Show preview and **wait for approval**
6. Upload to Supabase on approval

---

## 7. Error Handling

| Error | Action |
|---|---|
| Gemini rate limit (429) | Wait 30s, retry up to 3 times |
| Gemini returns non-JSON | Strip markdown, try to extract JSON, retry once |
| PDF is text-based (not scanned) | Use pdfminer directly instead of OCR |
| Exam already exists in DB | Warn user, ask to overwrite or skip |
| Supabase insert fails | Rollback exam, report error |
| No correction page found | Flag question, ask user to provide answers manually |

---

## 8. Output Files

During extraction, these files are created in the project root:

| File | Purpose |
|---|---|
| `pages.json` | PDF pages as base64 JPEGs |
| `gemini_questions.json` | Raw Gemini question extraction |
| `gemini_answers.json` | Raw Gemini answer extraction |
| `exam_preview.json` | Cleaned, merged data for user review |
