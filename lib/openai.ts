import OpenAI from "openai";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function summarizeClubStory(input: {
  title: string;
  excerpt?: string;
  source?: string;
}) {
  const client = getOpenAIClient();

  if (!client) {
    return "OpenAI is not configured. Add OPENAI_API_KEY to generate a ClubFlow summary.";
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You summarize private club industry news for GMs, COOs, board members, consultants, and vendors. Be concise, neutral, and operationally useful."
      },
      {
        role: "user",
        content: `Title: ${input.title}\nSource: ${input.source ?? "Unknown"}\nExcerpt: ${
          input.excerpt ?? "No excerpt available."
        }\n\nWrite a 2 sentence ClubFlow summary.`
      }
    ],
    temperature: 0.3,
    max_tokens: 140
  });

  return response.choices[0]?.message.content?.trim() ?? "";
}
