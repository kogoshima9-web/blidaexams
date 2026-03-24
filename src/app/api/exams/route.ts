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
  const status = searchParams.get("status");
  const schoolYearId = searchParams.get("schoolYearId");
  const subjectId = searchParams.get("subjectId");

  let query = supabaseAdmin
    .from("exams")
    .select(`
      *,
      subject:subjects(id, name),
      school_year:school_years(id, name, short_label),
      questions(*)
    `);

  if (status === "published") {
    query = query.eq("is_published", true);
  } else if (status === "draft") {
    query = query.eq("is_published", false);
  }

  if (schoolYearId) {
    query = query.eq("school_year_id", schoolYearId);
  }

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

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

    // Insert exam
    const { data: exam, error: examError } = await supabaseAdmin
      .from("exams")
      .insert({
        university: data.university,
        year: data.year,
        exam_type: data.examType,
        school_year_id: data.schoolYearId,
        subject_id: data.subjectId,
        is_published: data.isPublished ?? false,
        original_pdf_url: data.originalPdfUrl || null,
      })
      .select()
      .single();

    if (examError) {
      return NextResponse.json({ error: examError.message }, { status: 500 });
    }

    // Insert questions if provided
    if (data.questions && data.questions.length > 0) {
      const questionsToInsert = data.questions.map((q: any, index: number) => {
        const ca = q.correctAnswer;
        let correctAnswer = Array.isArray(ca) ? ca : [ca];
        if (correctAnswer.length === 0) correctAnswer = [0];
        const postgresArray = `{${correctAnswer.join(',')}}`;
        return {
          exam_id: exam.id,
          question_order: index + 1,
          question_text: q.text,
          options: q.options,
          correct_answer: correctAnswer[0],
          correct_answers: postgresArray,
          image_url: q.imageUrl,
          pdf_link: q.pdfLink,
        };
      });

      const { error: qError } = await supabaseAdmin
        .from("questions")
        .insert(questionsToInsert);

      if (qError) {
        // Rollback exam
        await supabaseAdmin.from("exams").delete().eq("id", exam.id);
        return NextResponse.json({ error: qError.message }, { status: 500 });
      }
    }

    // Fetch the complete exam with questions
    const { data: completeExam } = await supabaseAdmin
      .from("exams")
      .select(`
        *,
        subject:subjects(id, name),
        school_year:school_years(id, name, short_label),
        questions(*)
      `)
      .eq("id", exam.id)
      .single();

    return NextResponse.json(completeExam, { status: 201 });
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
    const { id, questions, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    // Update exam
    const updatePayload: any = {};
    if (updateData.university !== undefined) updatePayload.university = updateData.university;
    if (updateData.year !== undefined) updatePayload.year = updateData.year;
    if (updateData.examType !== undefined) updatePayload.exam_type = updateData.examType;
    if (updateData.schoolYearId !== undefined) updatePayload.school_year_id = updateData.schoolYearId;
    if (updateData.subjectId !== undefined) updatePayload.subject_id = updateData.subjectId;
    if (updateData.isPublished !== undefined) updatePayload.is_published = updateData.isPublished;
    if (updateData.originalPdfUrl !== undefined) updatePayload.original_pdf_url = updateData.originalPdfUrl || null;
    updatePayload.updated_at = new Date().toISOString();

    const { data: exam, error: examError } = await supabaseAdmin
      .from("exams")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (examError) {
      return NextResponse.json({ error: examError.message }, { status: 500 });
    }
    if (!exam) {
      return NextResponse.json({ error: "Examen non trouvé" }, { status: 404 });
    }

    // Update questions if provided
    if (questions !== undefined) {
      // Delete existing questions
      await supabaseAdmin.from("questions").delete().eq("exam_id", id);

      // Insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((q: any, index: number) => {
          const ca = q.correctAnswer;
          let correctAnswer = Array.isArray(ca) ? ca : [ca];
          if (correctAnswer.length === 0) correctAnswer = [0];
          const postgresArray = `{${correctAnswer.join(',')}}`;
          return {
            exam_id: id,
            question_order: index + 1,
            question_text: q.text || q.questionText,
            options: q.options,
            correct_answer: correctAnswer[0],
            correct_answers: postgresArray,
            image_url: q.imageUrl,
            pdf_link: q.pdfLink,
          };
        });

        await supabaseAdmin.from("questions").insert(questionsToInsert);
      }
    }

    // Fetch complete exam
    const { data: completeExam } = await supabaseAdmin
      .from("exams")
      .select(`
        *,
        subject:subjects(id, name),
        school_year:school_years(id, name, short_label),
        questions(*)
      `)
      .eq("id", id)
      .single();

    return NextResponse.json(completeExam);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
