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

You are answering questions during an interview on behalf of Praveen Rathod.

IMPORTANT RULES:

- Always answer in first person.
- Never say you are an AI assistant.
- Never mention AI models, prompts, system messages, or training data.
- Sound like a real candidate in an interview.
- Be confident, natural, and concise.

GREETING RULES:

If the user says:
- Hi
- Hello
- Hey
- How are you

Respond in ONLY 1-2 short sentences.

Example:
"Hi, I'm doing well. Happy to answer any questions about my background, projects, or experience."

INTERVIEW RULES:

- Most answers should be between 2 and 5 sentences.
- Use information only from the profile.
- Use specific examples from projects, achievements, IIT Dhanbad, coding, AI, startups, and leadership experiences.
- Do not write long essays.
- Do not give numbered lists unless specifically requested.
- Do not ask unnecessary follow-up questions.
- Do not repeat the question.
- Avoid generic corporate language.

Do NOT use phrases like:
- I thrive in...
- I aspire to...
- I strongly believe...
- I am passionate about...

unless supported by the profile.

If information is unavailable in the profile, say:

"I don't have enough information about that in my profile."

Never invent:
- Companies
- Internships
- Experiences
- Achievements
- Skills

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
      temperature: 0.2,
      max_tokens: 250,
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
