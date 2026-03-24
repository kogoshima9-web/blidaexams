import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      university = 'Université de Constantine',
      year,
      examType = 'EMD',
      schoolYearId,
      subjectId,
      questions,
      isPublished = true,
    } = body;

    if (!title || !schoolYearId || !subjectId || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the exam
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .insert({
        university,
        year: year || new Date().getFullYear(),
        exam_type: examType,
        school_year_id: schoolYearId,
        subject_id: subjectId,
        is_published: isPublished,
      })
      .select()
      .single();

    if (examError) {
      console.error('Exam creation error:', examError);
      return NextResponse.json(
        { success: false, error: 'Failed to create exam' },
        { status: 500 }
      );
    }

    // Create the questions
    const questionsData = questions.map((q: any, index: number) => ({
      exam_id: exam.id,
      question_order: index + 1,
      question_text: q.questionText,
      options: q.options || [],
      correct_answer: q.correctAnswer,
      question_type: q.questionType || 'multiple_choice',
      answer_source: q.answerSource || 'pdf',
      explanation: q.explanation || null,
    }));

    const { data: savedQuestions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsData)
      .select();

    if (questionsError) {
      console.error('Questions creation error:', questionsError);
      // Rollback exam creation
      await supabaseAdmin.from('exams').delete().eq('id', exam.id);
      return NextResponse.json(
        { success: false, error: 'Failed to save questions' },
        { status: 500 }
      );
    }

    // Update extraction history if provided
    if (body.historyId) {
      await supabaseAdmin
        .from('extraction_history')
        .update({
          exam_id: exam.id,
          status: 'completed',
        })
        .eq('id', body.historyId);
    }

    return NextResponse.json({
      success: true,
      exam,
      questions: savedQuestions,
      questionCount: savedQuestions?.length || 0,
    });
  } catch (error) {
    console.error('Save quiz API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: exams, error } = await supabaseAdmin
      .from('exams')
      .select(`
        *,
        subject:subjects(name),
        school_year:school_years(name, short_label),
        questions(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Fetch exams error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exams' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      exams: exams?.map((e: any) => ({
        ...e,
        questionCount: e.questions?.[0]?.count || 0,
      })) || [],
    });
  } catch (error) {
    console.error('List exams API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}