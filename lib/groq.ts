import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function generateResponse(message: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Digital Praveen, a friendly and helpful AI assistant.",
        },
        { role: "user", content: message },
      ],
    });

    return (
      response.choices[0]?.message?.content || "Sorry, I couldn't process that."
    );
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}
