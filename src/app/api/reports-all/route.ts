import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data: reports, error } = await supabaseAdmin
      .from("question_reports")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!reports || reports.length === 0) {
      return NextResponse.json([]);
    }

    const examIds = [...new Set(reports.map(r => r.exam_id))];
    const questionIds = [...new Set(reports.map(r => r.question_id))];

    const [examsResult, questionsResult] = await Promise.all([
      supabaseAdmin
        .from("exams")
        .select("id, university, year, subject_id")
        .in("id", examIds),
      supabaseAdmin
        .from("questions")
        .select("id, question_order")
        .in("id", questionIds),
    ]);

    const examMap = new Map(examsResult.data?.map(e => [e.id, e]) || []);
    const questionMap = new Map(questionsResult.data?.map(q => [q.id, q.question_order]) || []);

    const subjectIds = [...new Set(examsResult.data?.map(e => e.subject_id).filter(Boolean) || [])];
    let subjectMap = new Map();

    if (subjectIds.length > 0) {
      const { data: subjects } = await supabaseAdmin
        .from("subjects")
        .select("id, name")
        .in("id", subjectIds);
      subjectMap = new Map(subjects?.map(s => [s.id, s.name]) || []);
    }

    const reportsWithDetails = reports.map(report => {
      const exam = examMap.get(report.exam_id);
      return {
        ...report,
        question_order: questionMap.get(report.question_id) || null,
        exam: exam ? {
          ...exam,
          subject_name: exam.subject_id ? subjectMap.get(exam.subject_id) || null : null,
        } : null,
      };
    });

    return NextResponse.json(reportsWithDetails);
  } catch (error) {
    console.error("Error in reports-all:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des signalements" }, { status: 500 });
  }
}