import * as fs from "fs";
import https from "https";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const GEMINI_API_KEY = "AIzaSyCPUXO3dIXKbE3CQL9Mh5S-IoGNjCfyWKQ";
const MODEL = "gemini-2.5-flash";

function sendToGemini(parts, jsonMode = false) {
  return new Promise((resolve, reject) => {
    const config = { temperature: 0.1 };
    if (jsonMode) config.responseMimeType = "application/json";

    const payload = { contents: [{ parts }], generationConfig: config };
    const body = JSON.stringify(payload);
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => (data += c));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          try {
            const err = JSON.parse(data);
            reject(new Error(`HTTP ${res.statusCode}: ${err.error?.message || data.substring(0, 300)}`));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
          }
          return;
        }
        try {
          const json = JSON.parse(data);
          let text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          text = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
          resolve(text);
        } catch {
          reject(new Error("Parse error: " + data.substring(0, 200)));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function parseJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) return null;
  return JSON.parse(text.substring(start, end));
}

async function main() {
  console.log("Model:", MODEL);
  const pageImages = JSON.parse(fs.readFileSync("pages.json", "utf-8"));
  console.log(`${pageImages.length} pages loaded`);

  const SYSTEM = "Tu réponds EXCLUSIVEMENT en JSON valide en français. Pas de texte, pas d'explication. Seulement du JSON.";

  // Extract ALL questions from pages 1-5
  const prompt1 = `${SYSTEM}

À partir des 5 images ci-jointes (examen Pharmacologie, Université de Constantine 3, 2023), extrais TOUTES les questions QCM numérotées.

Réponds uniquement en JSON:
{"exam_info":{"university":"Université de Constantine","year":2023,"exam_type":"EMD","subject":"Pharmacologie"},"questions":[{"number":1,"text":"question","options":["A","B","C","D","E"],"correct_answer":0}]}

Règles: correct_answer = index (0=a, 1=b, 2=c, 3=d, 4=e). Chaque question peut avoir plusieurs bonnes réponses - utilise la PREMIÈRE lettre (index 0=a). JSON:`;

  console.log("\nExtracting ALL questions from all 5 pages...");
  const result1 = await sendToGemini(
    pageImages.map(img => ({ inlineData: { mimeType: "image/jpeg", data: img } })).concat([{ text: prompt1 }]),
    true
  );
  console.log(`Got ${result1.length} chars`);
  fs.writeFileSync("gemini_p1.json", result1, "utf-8");
  const data1 = parseJSON(result1);
  console.log(`${data1?.questions?.length || 0} questions`);

  // Extract answers from all pages (correction key)
  const prompt2 = `${SYSTEM}

À partir des images ci-jointes (corrigé type d'examen Pharmacologie 2023), extrais les réponses.

Réponds uniquement en JSON:
{"answers":[{"number":1,"correct_answer":0},{"number":2,"correct_answer":2}]}

correct_answer = index (0=a, 1=b, 2=c, 3=d, 4=e). JSON:`;

  console.log("\nExtracting answers from correction pages...");
  const result2 = await sendToGemini(
    pageImages.map(img => ({ inlineData: { mimeType: "image/jpeg", data: img } })).concat([{ text: prompt2 }]),
    true
  );
  console.log(`Got ${result2.length} chars`);
  fs.writeFileSync("gemini_p2.json", result2, "utf-8");
  const data2 = parseJSON(result2);
  console.log(`${data2?.answers?.length || 0} answers`);

  if (!data1?.questions?.length) { console.error("No questions!"); return; }

  // Merge answers
  console.log("\nMerging...");
  const answerMap = {};
  for (const a of data2?.answers || []) {
    answerMap[a.number] = a.correct_answer;
  }

  const questions = data1.questions.map(q => ({
    ...q,
    correct_answer: answerMap[q.number] ?? q.correct_answer ?? 0,
  }));

  const finalData = {
    exam_info: data1.exam_info || {
      university: "Université de Constantine",
      year: 2023,
      exam_type: "EMD",
      subject: "Pharmacologie",
    },
    questions,
  };

  fs.writeFileSync("gemini_final.json", JSON.stringify(finalData, null, 2), "utf-8");
  console.log(`\n✅ ${questions.length} questions with answers`);
  for (let i = 0; i < Math.min(5, questions.length); i++) {
    const q = questions[i];
    const ans = q.options?.[q.correct_answer] || "?";
    console.log(`  Q${q.number}: ${q.text?.substring(0, 45)}... => ${ans.substring(0, 40)}`);
  }

  // Delete old exam and upload new
  console.log("\nUploading to Supabase...");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Delete old 2023 exam
  const { data: old } = await supabase.from("exams").select("id").eq("year", 2023).eq("subject_id", "97d2e9d9-6b4d-4706-a2f4-31e6dc4d592e");
  for (const e of old || []) {
    await supabase.from("questions").delete().eq("exam_id", e.id);
    await supabase.from("exams").delete().eq("id", e.id);
  }
  console.log("Deleted old exam(s)");

  const { data: years } = await supabase.from("school_years").select("id").eq("short_label", "3ème").single();
  const { data: subjects } = await supabase.from("subjects").select("id").eq("name", "Pharmacologie").single();

  const { data: exam, error: examError } = await supabase.from("exams").insert({
    university: finalData.exam_info.university,
    year: finalData.exam_info.year,
    exam_type: finalData.exam_info.exam_type,
    school_year_id: years.id,
    subject_id: subjects.id,
    is_published: true,
  }).select().single();

  if (examError) { console.error("Exam error:", examError.message); return; }
  console.log(`Created exam: ${exam.id}`);

  for (let i = 0; i < questions.length; i += 20) {
    const batch = questions.slice(i, i + 20).map((q, idx) => ({
      exam_id: exam.id,
      question_order: q.number || i + idx + 1,
      question_text: q.text,
      options: q.options,
      correct_answer: q.correct_answer ?? 0,
    }));
    await supabase.from("questions").insert(batch);
  }

  console.log(`\n🎉 Done! Exam ID: ${exam.id}`);
  console.log(`URL: http://localhost:3010/4/exam/${exam.id}`);
}

main().catch(console.error);
