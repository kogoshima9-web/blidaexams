import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return NextResponse.json({ error: "examId requis" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("questions")
    .select("*")
    .eq("exam_id", examId)
    .order("question_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const data = await request.json();
    const { examId, ...questionData } = data;

    if (!examId) {
      return NextResponse.json({ error: "examId requis" }, { status: 400 });
    }

    // Get current question count for order
    const { count } = await supabaseAdmin
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("exam_id", examId);

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .insert({
        exam_id: examId,
        question_order: (count || 0) + 1,
        question_text: questionData.text,
        options: questionData.options || [],
        correct_answer: questionData.correctAnswer || 0,
        image_url: questionData.imageUrl,
        pdf_link: questionData.pdfLink,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(question, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const data = await request.json();
    const { examId, questionId, ...updateData } = data;

    if (!examId || !questionId) {
      return NextResponse.json({ error: "examId et questionId requis" }, { status: 400 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updateData.text !== undefined) updatePayload.question_text = updateData.text;
    if (updateData.options !== undefined) updatePayload.options = updateData.options;
    if (updateData.correctAnswer !== undefined) updatePayload.correct_answer = updateData.correctAnswer;
    if (updateData.imageUrl !== undefined) updatePayload.image_url = updateData.imageUrl;
    if (updateData.pdfLink !== undefined) updatePayload.pdf_link = updateData.pdfLink;
    if (updateData.order !== undefined) updatePayload.question_order = updateData.order;

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .update(updatePayload)
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!question) {
      return NextResponse.json({ error: "Question non trouvée" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({ error: "questionId requis" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return NextResponse.json({ error: "examId requis" }, { status: 400 });
  }

  const questions = questionsStore.getByExamId(examId);
  return NextResponse.json(questions);
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { examId, ...questionData } = data;

    if (!examId) {
      return NextResponse.json({ error: "examId requis" }, { status: 400 });
    }

    const exam = examsStore.getById(examId);
    if (!exam) {
      return NextResponse.json({ error: "Examen non trouvé" }, { status: 404 });
    }

    const question = questionsStore.create(examId, {
      text: questionData.text,
      options: questionData.options || [],
      correctAnswer: questionData.correctAnswer || 0,
      imageUrl: questionData.imageUrl,
      pdfLink: questionData.pdfLink,
      order: exam.questions.length + 1,
    });

    return NextResponse.json(question, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { examId, questionId, ...updateData } = data;

    if (!examId || !questionId) {
      return NextResponse.json({ error: "examId et questionId requis" }, { status: 400 });
    }

    const question = questionsStore.update(examId, questionId, updateData);

    if (!question) {
      return NextResponse.json({ error: "Question non trouvée" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const questionId = searchParams.get("questionId");

    if (!examId || !questionId) {
      return NextResponse.json({ error: "examId et questionId requis" }, { status: 400 });
    }

    const success = questionsStore.delete(examId, questionId);

    if (!success) {
      return NextResponse.json({ error: "Question non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
