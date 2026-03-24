import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const subjectId = searchParams.get('subjectId');
  const schoolYearId = searchParams.get('schoolYearId');
  
  let query = supabaseAdmin
    .from('exams')
    .select(`
      *,
      subject:subjects(id, name, description),
      school_year:school_years(id, name, short_label)
    `)
    .eq('is_published', true);
  
  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }
  if (schoolYearId) {
    query = query.eq('school_year_id', schoolYearId);
  }
  
  const { data, error } = await query.order('year', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const examsWithCounts = await Promise.all(
    (data || []).map(async (exam) => {
      const { count } = await supabaseAdmin
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', exam.id);
      return { ...exam, questionCount: count || 0 };
    })
  );
  
  return NextResponse.json(examsWithCounts, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
