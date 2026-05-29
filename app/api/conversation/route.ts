import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { conversationId, role, content } = body;

    const { error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role,
          content,
        },
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}