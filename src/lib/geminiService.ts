import { GoogleGenAI } from '@google/genai';

const googleApiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

if (!googleApiKey) {
  console.warn('GOOGLE_AI_API_KEY or GEMINI_API_KEY not set - AI extraction will not work');
}

export const genAI = googleApiKey ? new GoogleGenAI({ apiKey: googleApiKey }) : new GoogleGenAI({});

export interface ExtractedQuestion {
  questionText: string;
  options?: string[];
  correctAnswer: number | number[];
  explanation?: string;
  questionType: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay';
  answerSource: 'pdf' | 'ai_solved';
}

export interface ExtractionResult {
  success: boolean;
  questions: ExtractedQuestion[];
  error?: string;
  fileName: string;
  fileUrl?: string;
}

export interface AdditionalFile {
  name: string;
  base64: string;
  mimeType: string;
}

const BASE_SYSTEM_PROMPT = `You are an expert at extracting exam questions from PDF documents. Your task is to carefully analyze the PDF and extract ALL questions found.

Important rules:
1. If the PDF contains answer keys/solutions at the end, extract them and map to respective questions
2. If there are NO answers in the PDF, solve the questions yourself but mark them as "AI Solved"
3. For multiple choice questions, extract all options (A, B, C, D, E, etc.)
4. For multiple select questions, identify which options are correct
5. For true/false questions, identify the correct answer
6. For short answer/essay, note the expected answer format

Output format - JSON array with this structure:
[
  {
    "questionText": "The actual question text",
    "options": ["Option A", "Option B", "Option C", "Option D"] (for choice questions),
    "correctAnswer": 0 (for single answer - index of correct option) or [0, 2] (for multiple answers),
    "explanation": "Optional explanation or solution",
    "questionType": "multiple_choice" | "multiple_select" | "true_false" | "short_answer" | "essay",
    "answerSource": "pdf" (if answer from PDF) or "ai_solved" (if you solved it)
  }
]

Return ONLY valid JSON array, no additional text.`;

export async function extractQuestionsFromPDF(
  pdfBase64: string,
  mimeType: string,
  fileName: string,
  customNotes: string = '',
  additionalFiles: AdditionalFile[] = []
): Promise<ExtractionResult> {
  try {
    // Build the prompt with custom notes
    let systemPrompt = BASE_SYSTEM_PROMPT;
    
    if (customNotes.trim()) {
      systemPrompt += `\n\nCUSTOM INSTRUCTIONS FROM USER:\n${customNotes}\n\nPlease follow these instructions carefully when extracting questions.`;
    }

    if (additionalFiles.length > 0) {
      systemPrompt += `\n\nADDITIONAL FILES PROVIDED:\nThe user has also provided ${additionalFiles.length} additional file(s) to help with the extraction. Please analyze them along with the main PDF.`;
    }

    // Build contents array
    const contents: any[] = [
      {
        inlineData: {
          mimeType,
          data: pdfBase64,
        },
      },
      {
        text: systemPrompt,
      },
    ];

    // Add additional files to the prompt
    for (const additionalFile of additionalFiles) {
      contents.push({
        inlineData: {
          mimeType: additionalFile.mimeType,
          data: additionalFile.base64,
        },
      });
      
      contents.push({
        text: `[Additional file: ${additionalFile.name}] Please consider this file when extracting questions.`,
      });
    }

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    const responseText = result.text || '';

    // Clean up the response - extract JSON from markdown if present
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return {
        success: false,
        questions: [],
        error: 'Invalid response from AI - no JSON found',
        fileName,
      };
    }

    const questions = JSON.parse(jsonMatch[0]) as ExtractedQuestion[];

    return {
      success: true,
      questions,
      fileName,
    };
  } catch (error) {
    console.error('Extraction error:', error);
    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : 'Unknown error during extraction',
      fileName,
    };
  }
}