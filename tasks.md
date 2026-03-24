# blidaexams — Tasks & Milestones

---

## Milestone 1: Foundation & Setup

- [ ] Initialize Next.js project with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Set up PostgreSQL database (Supabase or Neon)
- [ ] Create database schema (School Years, Subjects, Exams, Questions)
- [ ] Set up environment variables (admin password, database URL)
- [ ] Create `format.txt` file documenting CSV and JSON import formats
- [ ] Set up i18n (French primary, English secondary)

---

## Milestone 2: Admin Panel — Core Structure

- [ ] Build `/admin` login page (password protection)
- [ ] Create School Year management (list, add)
- [ ] Create Subject management (list, add, link to School Year)
- [ ] Build sidebar/header navigation for admin
- [ ] Create admin dashboard overview

---

## Milestone 3: Exam Management (Admin)

- [ ] Manual exam creation form (university, year, school year, subject, questions)
- [ ] Variable answer options builder (add/remove options dynamically)
- [ ] Question image upload support
- [ ] CSV file upload with validation and preview
- [ ] JSON file upload with validation and preview
- [ ] Draft exam list view
- [ ] Edit existing published exams
- [ ] Delete exams
- [ ] Reorder questions in draft
- [ ] Publish / Unpublish toggle
- [ ] PDF link field per question

---

## Milestone 4: Student Frontend — Browse

- [ ] Build language switcher (French / English)
- [ ] darkd/light mode
- [ ] Home page with School Year selector (1-7)
- [ ] Subject selector page
- [ ] Exam list page with filters (University, Date)
- [ ] Exam card display (university, year, date)

---

## Milestone 5: Student Quiz Flow

- [ ] Quiz interface (one question at a time)
- [ ] Question text + optional image display
- [ ] Answer option selection
- [ ] Verify button with color feedback (green/red)
- [ ] Next button to advance
- [ ] Progress tracker (e.g., "Question 3/10")
- [ ] Score display at end
- [ ] Retake functionality (same order)

---

## Milestone 6: AI Explain Button

- [ ] Per-question "Explain with AI" button
- [ ] User selects preferred AI (ChatGPT or Gemini)
- [ ] Opens in new tab (browser or installed app on mobile)
- [ ] Pre-populates question text in prompt
- [ ] repor quiz botton

---

## Milestone 7: Review Mode

- [ ] Post-quiz review page
- [ ] One question at a time view
- [ ] Question tracker navigation
- [ ] Display student answer vs correct answer
- [ ] AI explain button available in review too
- [ ] PDF link button visible

---

## Milestone 8: Polish & Launch

- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Error handling (empty states, form validation)
- [ ] Loading states
- [ ] Admin UI polish
- [ ] Student UI polish
- [ ] Deploy to Vercel
- [ ] Test full admin workflow end-to-end
- [ ] Test full student flow end-to-end

---

## Task Priority Order

### Phase A — Must Have (MVP)
1. Project setup + DB schema
2. Admin login + exam CRUD
3. CSV/JSON import + publish
4. Student browse + quiz flow
5. Review mode
6. Basic UI (functional, not pretty)

### Phase B — Enhanced
7. AI explain button
8. PDF link per question
9. Question image upload
10. i18n (French/English)

### Phase C — Polish
11. Responsive design
12. UI polish
13. Error handling
14. Deployment

---

## Notes

- Language note: Primary language is **French**, secondary is **English**. All UI text should default to French.
- AI button: Open links in new tab, prefer mobile app if installed (use `href` with app scheme detection)
- CSV format note: Current format is 4 options max. Future update needed if variable options in CSV.
- JSON format supports variable options per question.
