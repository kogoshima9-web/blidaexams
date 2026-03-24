import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { questionId, examId, reportType, description } = await request.json();

    if (!questionId || !examId) {
      return NextResponse.json({ error: "questionId et examId requis" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("question_reports")
      .insert({
        question_id: questionId,
        exam_id: examId,
        report_type: reportType || "incorrect_answer",
        description: description || "",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la soumission du signalement" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get("examId");

  if (!examId) {
    return NextResponse.json({ error: "examId requis" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from("question_reports")
    .select("*")
    .eq("exam_id", examId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data && data.length > 0) {
    const questionIds = data.map(r => r.question_id);
    const { data: questionsData } = await supabaseAdmin
      .from("questions")
      .select("id, question_order")
      .in("id", questionIds);
    
    const questionMap = new Map();
    if (questionsData) {
      questionsData.forEach(q => questionMap.set(q.id, q.question_order));
    }
    
    const enrichedData = data.map(report => ({
      ...report,
      question_order: questionMap.get(report.question_id) || null
    }));
    
    return NextResponse.json(enrichedData);
  }

  return NextResponse.json(data || []);
}