# AI Integration PRD — SimpleMed

## 1. Overview

AI-powered feature to automatically extract questions, options, and correct answers from PDF exam files and convert them to JSON format for import into SimpleMed.

---

## 2. Problem Statement

Currently, admins must manually type exam questions one-by-one or use CSV/JSON upload. PDF exam processing is manual and time-consuming. This feature automates the extraction process.

---

## 3. Goals

1. **Automate PDF → JSON conversion** using Gemini 2.5 Flash
2. **Reduce admin workload** — upload PDF, get ready-to-import JSON
3. **Maintain accuracy** — extract questions exactly as they appear (text + images)
4. **Support French medical exams** — handle clinical cases, terminology

---

## 4. User Flow

```
Admin uploads PDF exam
        ↓
Gemini 2.5 Flash extracts text + images
        ↓
AI processes: identifies questions, options, correct answers
        ↓
Returns JSON with all questions (indexed 0-4 for A-E)
        ↓
Admin reviews/Edits JSON if needed
        ↓
Admin imports JSON to SimpleMed
```

---

## 5. AI Prompt Strategy

### Core Prompt Requirements

```text
Analyse ce PDF d'examen médical et extrais toutes les questions.

INSTRUCTIONS:
1. Copie chaque question à l'IDENTIQUE (même formulation, accents, ponctuation)
2. Liste TOUTES les options (A, B, C, D, E - garder l'ordre exact)
3. Pour les questions à choix multiples (plusieurs réponses possibles), note TOUTES les bonnes réponses
4. La correction se trouve à la DERNIÈRE PAGE du PDF - utilise-la pour identifier les bonnes réponses
5. Décris la situation clinique si présente (cas clinique, contexte patient)

FORMAT DE SORTIE (JSON):
{
  "university": "Nom de l'université (ex: Blida, Oran, Alger)",
  "year": 2023,
  "subject": "Nom de la matière",
  "schoolYear": 1-7,
  "questions": [
    {
      "question": "Texte exact de la question",
      "image": "",  // laisser vide si pas d'image
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correct": 0,  // index 0-based: 0=A, 1=B, 2=C, 3=D, 4=E (UNE seule réponse)
      "correctAnswers": [0, 3, 4]  // Pour questions multi-réponses: array d'index (ex: A, D, E)
    }
  ]
}

RÈGLES:
- NE PAS résoudre les questions, seulement les extraire
- Si question a plusieurs bonnes réponses: utiliser "correctAnswers" (array) et laisser "correct" à null
- Si question a une seule bonne réponse: utiliser "correct" (number) et ne pas inclure "correctAnswers"
- Compter toutes les questions de 1 jusqu'à la dernière
- Prendre les réponses depuis la dernière page du PDF
- Retourne SEULEMENT le JSON valide, pas de texte supplémentaire
```

### JSON Output Format (matching format.txt)

```json
{
  "university": "Oran",
  "year": 2023,
  "subject": "Pharmacologie",
  "schoolYear": 3,
  "questions": [
    {
      "question": "Texte exact de la question...",
      "image": "",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correct": 1,
      "correctAnswers": null
    },
    {
      "question": "Question à plusieurs réponses...",
      "image": "",
      "options": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
      "correct": null,
      "correctAnswers": [0, 2, 3]
    }
  ]
}
```

**Note:** 
- `correct`: single answer (index 0-4 for A-E)
- `correctAnswers`: array for multi-answer questions (e.g., [0, 3, 4] = A, D, E)

---

## 6. Technical Implementation

### Stack
- **AI Provider**: Google Gemini 2.5 Flash (via Google AI Studio API)
- **Frontend**: Next.js (new admin page for AI extraction)
- **API**: Next.js API route to handle PDF upload → Gemini call → JSON response
- **Storage**: Process locally, no long-term storage needed

### API Endpoint Design

```
POST /api/ai/extract-exam
Input: FormData with PDF file
Output: JSON with extracted questions
```

### Error Handling
- Invalid PDF format → clear error message
- Gemini processing failure → retry with fallback
- Empty extraction → prompt admin to verify PDF

---

## 7. Admin UI Components

1. **Upload Zone** — Drag & drop PDF
2. **Processing Indicator** — Loading state while Gemini processes
3. **Preview Panel** — Show extracted JSON for review
4. **Edit Mode** — Allow manual corrections before import
5. **Import Button** — Send JSON to existing `/api/exams` endpoint

---

## 8. Cost Model

- **API Cost**: Pay-per-use (Gemini 2.5 Flash is cost-effective)
- **Free for Admins**: Internal tool, not student-facing
- **Est. Cost**: ~$0.001-0.005 per exam PDF (depending on length)

---

## 9. Phased Implementation

### Phase 1 — 
- Upload PDF → Gemini extracts → Show JSON preview
- Basic validation
- Manual import to existing system

### Phase 2 —
- Image extraction from PDF (if applicable)
- Batch processing (multiple PDFs)
- Auto-detect university/year from PDF text

### Phase 3 
- Direct import to DB (skip manual step)
- Support for image-based exams (photos)
- Export to CSV

---


---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-------------|
| Gemini misreads handwriting | Add manual edit step before import |
| PDF has complex formatting | Prompt engineering + fallback to manual |
| API rate limits | Queue processing, show status |
| Cost overracing | Set monthly budget cap, monitor usage |

---

## 12. Success Metrics

- [ ] Admin can upload PDF and receive JSON in <30s
- [ ] 90%+ accuracy on standard formatted exams
- [ ] Admin can edit extracted data before import
- [ ] Zero failed imports due to AI errors (after manual review)

---

## 13. Potential Improvements

**Better approaches to consider:**

1. **Vision API (Recommended)**: Use Gemini's vision capabilities to read the PDF as images — more accurate for scanned documents
   - Send each page as an image, not as text
   - Better handling of complex layouts, tables, images in questions

2. **Two-pass extraction**: 
   - Pass 1: Extract all questions + options
   - Pass 2: Use last page to map correct answers (more reliable)

3. **Validation step**: After extraction, show admin a summary:
   - "Found 45 questions, 3 with multi-answers"
   - Auto-detect university/year from first page text

4. **Batch processing**: Allow uploading multiple PDFs at once (useful for archiving old exams)

---

## 14. Next Steps

1. Set up Gemini API key in `.env.local`
2. Create `/api/ai/extract-exam` endpoint
3. Build admin UI page at `/admin/ai-extract`
4. Test with sample PDF (Pharmacologie Oran 2023)
5. Iterate on prompt for better accuracy