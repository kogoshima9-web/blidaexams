import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const [examsRes, subjectsRes, schoolYearsRes, universitiesRes] = await Promise.all([
      supabaseAdmin.from("exams").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("subjects").select("*").order("name"),
      supabaseAdmin.from("school_years").select("*").order("display_order"),
      supabaseAdmin.from("universities").select("*").order("display_order"),
    ]);

    const backup = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      exams: examsRes.data || [],
      subjects: subjectsRes.data || [],
      schoolYears: schoolYearsRes.data || [],
      universities: universitiesRes.data || [],
    };

    return NextResponse.json(backup);
  } catch (error) {
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const backup = await request.json();

    if (!backup.version || !backup.exams) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }

    const results = {
      universities: 0,
      schoolYears: 0,
      subjects: 0,
      exams: 0,
    };

    if (backup.universities?.length > 0) {
      for (const uni of backup.universities) {
        const { data: existing } = await supabaseAdmin
          .from("universities")
          .select("id")
          .eq("name", uni.name)
          .maybeSingle();
        
        if (!existing) {
          await supabaseAdmin.from("universities").insert({
            name: uni.name,
            city: uni.city,
            display_order: uni.display_order,
          });
          results.universities++;
        }
      }
    }

    if (backup.schoolYears?.length > 0) {
      for (const sy of backup.schoolYears) {
        const { data: existing } = await supabaseAdmin
          .from("school_years")
          .select("id")
          .eq("name", sy.name)
          .maybeSingle();
        
        if (!existing) {
          await supabaseAdmin.from("school_years").insert({
            name: sy.name,
            short_label: sy.short_label,
            display_order: sy.display_order,
          });
          results.schoolYears++;
        }
      }
    }

    if (backup.subjects?.length > 0) {
      for (const subj of backup.subjects) {
        const { data: existing } = await supabaseAdmin
          .from("subjects")
          .select("id")
          .eq("name", subj.name)
          .eq("school_year_id", subj.school_year_id)
          .maybeSingle();
        
        if (!existing) {
          await supabaseAdmin.from("subjects").insert({
            name: subj.name,
            school_year_id: subj.school_year_id,
            description: subj.description,
          });
          results.subjects++;
        }
      }
    }

    if (backup.exams?.length > 0) {
      for (const exam of backup.exams) {
        const { data: existing } = await supabaseAdmin
          .from("exams")
          .select("id")
          .eq("university", exam.university)
          .eq("year", exam.year)
          .eq("subject_id", exam.subject_id)
          .maybeSingle();

        if (!existing) {
          const { data: newExam } = await supabaseAdmin.from("exams").insert({
            university: exam.university,
            year: exam.year,
            exam_type: exam.exam_type,
            school_year_id: exam.school_year_id,
            subject_id: exam.subject_id,
            is_published: exam.is_published,
            original_pdf_url: exam.original_pdf_url,
          }).select().single();

          if (newExam && exam.questions?.length > 0) {
            for (const q of exam.questions) {
              await supabaseAdmin.from("questions").insert({
                exam_id: newExam.id,
                question_text: q.question_text,
                options: q.options,
                correct_answers: q.correct_answers,
                image_url: q.image_url,
                pdf_link: q.pdf_link,
                question_order: q.question_order,
              });
            }
          }
          results.exams++;
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  }
}
