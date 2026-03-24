import { supabaseAdmin } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin;
    const body = await request.json();
    
    const {
      userName,
      userEmail,
      userPhone,
      examYear,
      examUniversity,
      examType,
      notes,
      fileUrls,
    } = body;

    // Validate required fields - at least some info should be provided
    if (!examYear && !examUniversity && !notes && (!fileUrls || fileUrls.length === 0)) {
      return NextResponse.json(
        { error: "Veuillez fournir au moins des informations sur l'examen ou uploader un fichier." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("exam_submissions")
      .insert({
        user_name: userName || null,
        user_email: userEmail || null,
        user_phone: userPhone || null,
        exam_year: examYear ? parseInt(examYear) : null,
        exam_university: examUniversity || null,
        exam_type: examType || null,
        notes: notes || null,
        file_urls: fileUrls || [],
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi. Veuillez réessayer." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from("exam_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des données." },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
