import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  
  const { id } = await params;
  
  const { data: exam, error: examError } = await supabaseAdmin
    .from('exams')
    .select(`
      *,
      subject:subjects(id, name, description, school_year_id),
      school_year:school_years(id, name, short_label),
      questions(*)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();
  
  if (examError || !exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }
  
  // Sort questions by order
  if (exam.questions) {
    exam.questions.sort((a, b) => a.question_order - b.question_order);
  }
  
  return NextResponse.json(exam);
}
