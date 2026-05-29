import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/llm";
import profile from "@/data/profile.json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { question, chatHistory = [] } = body;

    const answer = await generateResponse(
      question,
      profile,
      chatHistory
    );

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}