import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("ELEVENLABS ERROR:", errorText);

      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    const audioBase64 = Buffer.from(audioBuffer).toString(
      "base64"
    );

    return NextResponse.json({
      audio: audioBase64,
    });
  } catch (error) {
    console.error("TTS API ERROR:", error);

    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}