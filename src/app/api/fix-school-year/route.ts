import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
  }
  
  const results: any = {};
  
  // Step 1: Get ALL school years without any filtering (direct query)
  const { data: allYears, error: yearsError } = await supabaseAdmin
    .from('school_years')
    .select('id, name, display_order')
    .order('created_at', { ascending: true });
  
  if (yearsError) {
    return NextResponse.json({ error: yearsError.message }, { status: 500 });
  }
  
  if (!allYears || allYears.length === 0) {
    return NextResponse.json({ error: 'No school years found' }, { status: 404 });
  }
  
  results.totalSchoolYears = allYears.length;
  results.allSchoolYears = allYears; // Include all years for debugging
  
  // Build a map of unique school years by name+order -> first (canonical) ID
  const canonicalYears = new Map<string, string>();
  const duplicateYearIds: string[] = [];
  
  for (const year of allYears) {
    const key = `${year.display_order}-${year.name}`;
    if (canonicalYears.has(key)) {
      duplicateYearIds.push(year.id);
    } else {
      canonicalYears.set(key, year.id);
    }
  }
  
  results.duplicatesFound = duplicateYearIds.length;
  results.duplicates = duplicateYearIds;
  
  // Step 2: Update all subjects with duplicate school_year_id to use canonical ID
  const { data: allSubjects } = await supabaseAdmin
    .from('subjects')
    .select('id, name, school_year_id');
  
  const fixedSubjects: string[] = [];
  for (const subject of (allSubjects || [])) {
    if (duplicateYearIds.includes(subject.school_year_id)) {
      // Find the canonical ID for this subject's school year
      const year = allYears.find(y => y.id === subject.school_year_id);
      if (year) {
        const key = `${year.display_order}-${year.name}`;
        const canonicalId = canonicalYears.get(key);
        if (canonicalId && canonicalId !== subject.school_year_id) {
          await supabaseAdmin
            .from('subjects')
            .update({ school_year_id: canonicalId })
            .eq('id', subject.id);
          fixedSubjects.push(subject.name);
        }
      }
    }
  }
  results.fixedSubjects = fixedSubjects;
  
  // Step 3: Update all exams with duplicate school_year_id to use canonical ID
  const { data: allExams } = await supabaseAdmin
    .from('exams')
    .select('id, university, year, school_year_id');
  
  const fixedExams: string[] = [];
  for (const exam of (allExams || [])) {
    if (duplicateYearIds.includes(exam.school_year_id)) {
      const year = allYears.find(y => y.id === exam.school_year_id);
      if (year) {
        const key = `${year.display_order}-${year.name}`;
        const canonicalId = canonicalYears.get(key);
        if (canonicalId && canonicalId !== exam.school_year_id) {
          await supabaseAdmin
            .from('exams')
            .update({ school_year_id: canonicalId })
            .eq('id', exam.id);
          fixedExams.push(`${exam.university} ${exam.year}`);
        }
      }
    }
  }
  results.fixedExams = fixedExams;
  
  // Step 4: Delete duplicate school years
  if (duplicateYearIds.length > 0) {
    const { error } = await supabaseAdmin
      .from('school_years')
      .delete()
      .in('id', duplicateYearIds);
    
    if (error) {
      results.deleteError = error.message;
    } else {
      results.deletedDuplicates = duplicateYearIds.length;
    }
  }
  
  // Step 5: Return final state
  const { data: finalYears } = await supabaseAdmin
    .from('school_years')
    .select('id, name, display_order')
    .order('display_order');
  
  results.finalSchoolYears = finalYears;
  
  return NextResponse.json(results);
}
