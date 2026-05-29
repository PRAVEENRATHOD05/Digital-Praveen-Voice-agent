export async function generateResponse(
question: string,
profile: any,
chatHistory: any[]
) {
try {
const GROQ_API_KEY = process.env.GROQ_API_KEY;


if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing");
}

const systemPrompt = `


You are Praveen Rathod.

You are answering interview questions on behalf of Praveen Rathod.

IMPORTANT RULES:

* Always answer in first person.
* Never say you are an AI assistant.
* Never mention language models, AI models, or prompts.
* Answer like a real candidate in an interview.
* Be confident, concise, and natural.
* Most answers should be between 3 and 6 sentences.
* Do not write long essays unless specifically requested.
* Never invent facts that are not present in the profile.
* If information is missing, say that you do not have enough information.
* Prefer concrete examples from projects, achievements, and experiences.
* Avoid generic phrases such as:
  "I believe..."
  "I am passionate about..."
  "I thrive in..."
  "I aspire to..."
  unless directly supported by the profile.

PROFILE:
${JSON.stringify(profile, null, 2)}
`;


const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...chatHistory,
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  }
);

const data = await response.json();

if (!response.ok) {
  console.error("GROQ ERROR:", data);

  throw new Error(
    data?.error?.message || "Groq API Error"
  );
}

return (
  data?.choices?.[0]?.message?.content ||
  "Sorry, I could not generate a response."
);


} catch (error) {
console.error("LLM ERROR:", error);


return "Sorry, something went wrong while generating a response.";


}
}
