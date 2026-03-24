import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = "AIzaSyCPUXO3dIXKbE3CQL9Mh5S-IoGNjCfyWKQ";
const PDF_PATH = "pharmaco_emd_2023_new.pdf";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Read PDF as base64
  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const pdfBase64 = pdfBuffer.toString("base64");

  console.log("Sending PDF to Gemini...\n");

  const prompt = `Tu es un assistant spécialisé en extraction d'examens médicaux algériens.

À partir du PDF d'examen médical ci-joint (Examen de Pharmacologie, Université de Constantine, 2023), extrais TOUTES les questions QCM avec leurs options et les réponses correctes.

RÈGLES TRÈS IMPORTANTES:
1. Chaque question peut avoir PLUSIEURS réponses correctes (QCM à réponses multiples)
2. Les réponses correctes sont INDQUÉES dans le document (page de correction)
3. Réponds UNIQUEMENT en JSON, sans texte additionnel
4. Les réponses correctes sont données par lettre (a, b, c, d, e)
5. Le format JSON doit être:
{
  "exam_info": {
    "university": "Université de Constantine",
    "year": 2023,
    "exam_type": "EMD",
    "subject": "Pharmacologie"
  },
  "questions": [
    {
      "number": 1,
      "text": "Texte de la question",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correct_answer": 0  // INDEX de la réponse correcte (0=a, 1=b, 2=c, 3=d, 4=e)
    }
  ]
}

Si une question a plusieurs réponses correctes (ex: a et c sont corrects), utilise la PREMIÈRE lettre (index 0=a) car le quiz supporte une seule réponse.
Mais note que certaines questions ont plusieurs bonnes réponses - dans ce cas, utilise la réponse la plus pertinente (première de la liste).

JSON:`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  console.log("Gemini response:\n", text?.substring(0, 500));

  let data;
  try {
    data = JSON.parse(text || "");
  } catch {
    console.error("Failed to parse JSON");
    return;
  }

  const questions = data.questions;
  console.log(`\nExtracted ${questions?.length || 0} questions`);

  if (!questions || questions.length === 0) {
    console.error("No questions extracted!");
    return;
  }

  // Preview first 3
  for (let i = 0; i < Math.min(3, questions.length); i++) {
    const q = questions[i];
    console.log(`\nQ${q.number}: ${q.text?.substring(0, 60)}...`);
    console.log(`  Answer: ${q.options?.[q.correct_answer]?.substring(0, 60)}`);
  }

  // Insert into Supabase
  console.log("\nInserting into Supabase...");

  // Get year 3 and Pharmacologie subject IDs
  const { data: years } = await supabase
    .from("school_years")
    .select("id")
    .eq("short_label", "3ème")
    .single();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id")
    .eq("name", "Pharmacologie")
    .single();

  if (!years || !subjects) {
    console.error("Could not find year or subject");
    return;
  }

  // Insert exam
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .insert({
      university: data.exam_info?.university || "Université de Constantine",
      year: data.exam_info?.year || 2023,
      exam_type: data.exam_info?.exam_type || "EMD",
      school_year_id: years.id,
      subject_id: subjects.id,
      is_published: true,
    })
    .select()
    .single();

  if (examError) {
    console.error("Exam insert error:", examError);
    return;
  }
  console.log(`Created exam: ${exam.id}`);

  // Insert questions in batches
  const questionsToInsert = questions.map((q: any, index: number) => ({
    exam_id: exam.id,
    question_order: q.number || index + 1,
    question_text: q.text,
    options: q.options,
    correct_answer: q.correct_answer ?? 0,
  }));

  for (let i = 0; i < questionsToInsert.length; i += 20) {
    const batch = questionsToInsert.slice(i, i + 20);
    const { error: qError } = await supabase.from("questions").insert(batch);
    if (qError) console.error(`Batch ${i} error:`, qError);
  }

  console.log(`\n✅ Done! ${questions.length} questions inserted`);
  console.log(`Exam ID: ${exam.id}`);
  console.log(`URL: http://localhost:3010/4/exam/${exam.id}`);
}

main().catch(console.error);
