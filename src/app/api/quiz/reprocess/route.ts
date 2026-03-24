import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { extractQuestionsFromPDF } from '@/lib/geminiService';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileBase64, mimeType, fileName, historyId, customPrompt } = body;

    if (!fileBase64 || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Missing file data' },
        { status: 400 }
      );
    }

    // Update history status
    if (historyId) {
      await supabaseAdmin
        .from('extraction_history')
        .update({ status: 'processing' })
        .eq('id', historyId);
    }

    // Extract with custom prompt if provided
    const result = await extractQuestionsFromPDF(fileBase64, mimeType, fileName);

    if (!result.success) {
      if (historyId) {
        await supabaseAdmin
          .from('extraction_history')
          .update({ 
            status: 'failed',
            error_message: result.error 
          })
          .eq('id', historyId);
      }
      
      return NextResponse.json(
        { success: false, error: result.error || 'Extraction failed' },
        { status: 500 }
      );
    }

    // Update history with results
    if (historyId) {
      await supabaseAdmin
        .from('extraction_history')
        .update({ 
          status: 'completed',
          extracted_at: new Date().toISOString(),
          questions_count: result.questions.length,
        })
        .eq('id', historyId);
    }

    return NextResponse.json({
      success: true,
      questions: result.questions,
      fileName: result.fileName,
    });
  } catch (error) {
    console.error('Re-process API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}