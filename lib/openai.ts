import OpenAI from "openai";
import { z } from "zod";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
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
    model: getOpenAIModel(),
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

const editorialBriefSchema = z.object({
  executiveSummary: z.string().trim().min(1),
  whatHappened: z.string().trim().min(1),
  whyItMatters: z.string().trim().min(1),
  entities: z
    .object({
      clubs: z.array(z.string()).default([]),
      companies: z.array(z.string()).default([]),
      people: z.array(z.string()).default([])
    })
    .default({ clubs: [], companies: [], people: [] }),
  location: z
    .object({
      city: z.string().nullable().default(null),
      state: z.string().nullable().default(null)
    })
    .default({ city: null, state: null })
});

export type EditorialBrief = z.infer<typeof editorialBriefSchema>;

const EDITORIAL_SYSTEM_PROMPT =
  "You are ClubFlow's editorial AI for the private golf club industry. You turn a raw RSS item into a structured editorial brief for GMs, COOs, board members, consultants, and vendors. Stay strictly scoped to golf courses, private/country clubs, golf resorts, club management companies, golf real estate/development, and club technology vendors. Respond with strict JSON only, matching the requested schema exactly. If a field cannot be determined from the input, use an empty string, empty array, or null as appropriate — never fabricate specifics not supported by the title or excerpt.";

/**
 * Processes a raw RSS item into ClubFlow's editorial brief format (executive summary,
 * what happened, why it matters) plus candidate entity/location extraction for the
 * Intelligence Graph. Never throws — returns null on any failure (no API key, API
 * error, malformed/invalid response) so callers can fail soft per article.
 */
export async function generateEditorialBrief(input: {
  title: string;
  excerpt?: string;
  source?: string;
}): Promise<EditorialBrief | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: getOpenAIModel(),
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: EDITORIAL_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Title: ${input.title}\nSource: ${input.source ?? "Unknown"}\nExcerpt: ${
            input.excerpt ?? "No excerpt available."
          }\n\nReturn a JSON object with exactly these keys:\n{\n  "executiveSummary": "2 neutral sentences summarizing the story",\n  "whatHappened": "2-3 factual sentences on what happened, based only on the title/excerpt",\n  "whyItMatters": "2-3 sentences on why this matters to private club/golf industry leaders",\n  "entities": { "clubs": ["club or course names mentioned, if any"], "companies": ["company/vendor names mentioned, if any"], "people": ["full person names mentioned, if any"] },\n  "location": { "city": "city name or null", "state": "state name or null" }\n}`
        }
      ]
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = editorialBriefSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error("[openai] generateEditorialBrief failed:", error);
    return null;
  }
}
