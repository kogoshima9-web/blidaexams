# SimpleMed — Exam Platform for Medicine Students

## 1. Overview

**blidaexams** is a web platform where instructors (professors, admins) post medical exams and students solve them for self-study. No student accounts, no tracking — students browse, solve, and review at their own pace.
- primary language is French and the secondary is English
---

## 2. User Roles

### 2.1 Admin (Instructor)
- Single password-protected account at `/admin`
- Manages Years, Subjects, and Exams
- Creates exams manually, via CSV upload, or via JSON upload
- Reviews/edits draft exams before publishing
- Full control over published exams

### 2.2 Student
- No account required
- Browses and solves published exams anonymously
- Can retake exams unlimited times (same question order)
- Reviews answers after completing an exam

---

## 3. Taxonomy & Navigation

### 3.1 Hierarchy
```
School Year (1-7)
  └── Subject (e.g., Anatomy, Pharmacology, Pathology)
        └── Exams (filtered by University, Date)
```

### 3.2 Student Browse Flow
1. Select School Year (1-7)
2. Select Subject
3. View list of published exams
4. Filter by: University, Date
5. Click exam to solve

---

## 4. Exam Structure

Each exam contains:
- **Title** (optional)
- **University** (e.g., Blida, Oran)
- **Year** (e.g., 2020, 2021, 2022)
- **Subject** (linked to Subject list)
- **School Year** (1-7)
- **Questions** (variable count)


Each question contains:
- **Question text**
- **Image** (optional)
- **Answer options** (variable count, minimum 2)
- **Correct answer** (one of the options)
- ** a littele button that takes the the quiz to chatgpt or Gemini(user chosese) opens them on the user's browser or installed app if on phone and ask the It to explain/solve it to them
- ** little button that takes the the student to the original PDF exam the link will be provided by the Admin

---

## 5. Exam Creation Methods

### 5.1 Manual
Admin types questions one by one in the admin panel.

### 5.2 CSV Upload
Instructors upload a `.csv` file. Format:
```
question,optionA,optionB,optionC,optionD,correct,image
"What is...?","A","B","C","D","B",""
```

### 5.3 JSON Upload
Instructors upload a `.json` file. Format:
```json
{
  "university": "Blida",
  "year": 2023,
  "subject": "Anatomy",
  "schoolYear": 2,
  "questions": [
    {
      "question": "What is...?",
      "image": "",
      "options": ["A", "B", "C", "D"],
      "correct": "B"
    }
  ]
}
-note: type the format on on a text file on the named format.txt on the projects folder
```

---

## 6. Admin Workflow

1. **Create/Select School Year** → add if not exists
2. **Create/Select Subject** → add if not exists
3. **Create Exam** via manual entry, CSV upload, or JSON upload
4. **Review Draft** → edit text, options, correct answer, image, delete/reorder questions
5. **Publish** → exam becomes visible to students

---

## 7. Student Solving Flow

1. Browse to exam → see first question
2. Select an answer
3. Click **Verify**
   - Correct answer → **green**
   - Wrong answer → **red** (correct answer highlighted green)
4. Click **Next** → move to next question
5. Repeat until last question
6. See **score** (e.g., "8/10")
7. Review answers one by one with a question tracker

---

## 8. Review Mode

After completing an exam:
- Questions displayed one by one
- Question number tracker (e.g., "Question 3/10")
- Shows student's answer + correct answer
- Student navigates manually (no auto-advance)

---

## 9. Tech Stack Recommendations

| Component | Recommendation |
|-----------|----------------|
| Frontend | Next.js (React) |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| Image Storage | Cloudinary or local |
| Auth (admin) | Password via env variable |
| Hosting | Vercel (frontend) + Supabase/Neon (DB) |

---

## 10. Out of Scope (v1)

- Student accounts / authentication
- Time limits on exams
- Search functionality
- Analytics / tracking
- Question bank management
- Notifications / email
- Mobile app

---

## 11. Future Considerations

- Excel file upload
- Instructor multi-account system
- Student progress tracking (optional)
- Student accounts (optional)
- Difficulty levels
- Explanations per question
