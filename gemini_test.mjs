import * as fs from "fs";
import https from "https";

const GEMINI_API_KEY = "AIzaSyCPUXO3dIXKbE3CQL9Mh5S-IoGNjCfyWKQ";

function sendToGemini(parts) {
  return new Promise((resolve, reject) => {
    const payload = {
      contents: [{ parts }],
      generationConfig: { temperature: 0.1 },
    };
    const body = JSON.stringify(payload);
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => (data += c));
      res.on("end", () => {
        console.log("Status:", res.statusCode);
        if (res.statusCode !== 200) {
          try {
            const err = JSON.parse(data);
            console.log("Error:", err.error?.message || data.substring(0, 300));
          } catch {
            console.log("Raw:", data.substring(0, 300));
          }
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        try {
          const json = JSON.parse(data);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
          resolve(text);
        } catch (e) {
          reject(new Error("Parse error: " + data.substring(0, 200)));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Test with small text
  console.log("Testing with small text...");
  try {
    const result = await sendToGemini([{
      text: "Réponds uniquement en JSON: {\"test\": true}. Pas de texte إضافي."
    }]);
    console.log("Result:", result);
  } catch (e) {
    console.error("Failed:", e.message);
  }

  // Now try with OCR text
  console.log("\nTrying with OCR text...");
  const ocrText = fs.readFileSync("pharmaco_2023_ocr.txt", "utf-8").substring(0, 3000);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const result = await sendToGemini([{
      text: `Tu es un assistant d'extraction d'examens médicaux.
À partir de ce texte OCR d'un examen Pharmacologie 2023, extrais les questions et réponses.
Texte OCR:
${ocrText}
Réponds UNIQUEMENT en JSON valide:
{"exam_info": {"university": "Université de Constantine", "year": 2023, "exam_type": "EMD", "subject": "Pharmacologie"}, "questions": [{"number": 1, "text": "...", "options": ["A","B","C","D","E"], "correct_answer": 0}]}
correct_answer = index 0=a, 1=b, 2=c, 3=d, 4=e. JSON:`
    }]);
    console.log(`Got ${result.length} chars`);
    fs.writeFileSync("gemini_ocr_result.json", result, "utf-8");
    const data = JSON.parse(result);
    console.log(`Questions: ${data.questions?.length}`);
    for (let i = 0; i < Math.min(3, data.questions?.length || 0); i++) {
      const q = data.questions[i];
      console.log(`Q${q.number}: ${q.text?.substring(0, 50)}... => ${q.options?.[q.correct_answer]?.substring(0, 40)}`);
    }
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

main().catch(console.error);
