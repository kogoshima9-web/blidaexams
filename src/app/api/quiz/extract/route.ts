import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { extractQuestionsFromPDF } from '@/lib/geminiService';

export const runtime = 'nodejs';
export const maxDuration = 120; // 120 seconds timeout for extraction with additional files

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const notes = formData.get('notes') as string || '';
    
    // Get additional files
    const additionalFiles: { name: string; base64: string; mimeType: string }[] = [];
    const additionalFilesEntries = formData.getAll('additionalFiles');
    
    for (const additionalFile of additionalFilesEntries) {
      if (additionalFile instanceof File) {
        const arrayBuffer = await additionalFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        additionalFiles.push({
          name: additionalFile.name,
          base64,
          mimeType: additionalFile.type,
        });
      }
    }
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Read file as base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Extract questions using Gemini with custom notes
    const result = await extractQuestionsFromPDF(
      base64,
      'application/pdf',
      file.name,
      notes,
      additionalFiles
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Extraction failed' },
        { status: 500 }
      );
    }

    // Save extraction history to Supabase
    const { data: historyRecord, error: historyError } = await supabaseAdmin
      .from('extraction_history')
      .insert({
        file_name: file.name,
        status: 'completed',
        extracted_at: new Date().toISOString(),
        questions_count: result.questions.length,
      })
      .select()
      .single();

    if (historyError) {
      console.error('Failed to save extraction history:', historyError);
    }

    return NextResponse.json({
      success: true,
      questions: result.questions,
      fileName: result.fileName,
      historyId: historyRecord?.id,
    });
  } catch (error) {
    console.error('Extraction API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}