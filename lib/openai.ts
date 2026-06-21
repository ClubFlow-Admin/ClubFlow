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

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
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
  dek: z.string().trim().default(""),
  executiveSummary: z.string().trim().min(1),
  whatHappened: z.string().trim().min(1),
  whyItMatters: z.string().trim().min(1),
  keyTakeaways: z.array(z.string().trim()).default([]),
  industryContext: z.string().trim().default(""),
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

const EDITORIAL_SYSTEM_PROMPT = `You are ClubFlow's editorial AI — you write executive intelligence briefings for the private golf club industry, read by GMs, COOs, owners, developers, investors, architects, and operators. ClubFlow should read like Bloomberg Intelligence for golf and private clubs, never like an RSS summary or a database record.

Stay strictly scoped to golf courses, private/country clubs, golf resorts, club management companies, golf real estate/development, and club technology vendors.

Ground rule on accuracy: you are given only a title and a short excerpt, not the full article. Never invent specific facts (numbers, names, dates, quotes) that are not present in the title or excerpt. Where you don't have enough information for a field, write less rather than fabricate — a short, honest paragraph beats a longer invented one. Your analytical sections (why it matters, industry context) should be framed as ClubFlow's analysis and reasonable industry context, not reported fact.

Writing style: professional, objective, concise, insightful, executive-level. Never sensational. Never sound AI-generated — no filler phrases like "in today's fast-paced world" or "it is worth noting that."

Respond with strict JSON only, matching the requested schema exactly.`;

const EDITORIAL_USER_PROMPT_TEMPLATE = (input: { title: string; excerpt?: string; source?: string }) =>
  `Title: ${input.title}\nSource: ${input.source ?? "Unknown"}\nExcerpt: ${
    input.excerpt ?? "No excerpt available."
  }\n\nWrite a complete executive briefing as a JSON object with exactly these keys:\n{\n  "dek": "one sentence subtitle/dek for the headline, plain prose, no period needed",\n  "executiveSummary": "2-3 short paragraphs giving a senior reader the full story at a glance",\n  "whatHappened": "several short paragraphs giving the factual account, grounded strictly in the title/excerpt — elaborate on what's stated, do not invent new facts",\n  "whyItMatters": "analysis aimed at club executives, GMs, owners, developers, investors, architects, and operators — explain the operating, capital, competitive, or talent implications. Do not just restate the news.",\n  "keyTakeaways": ["3 to 5 short, concrete bullet points an executive could skim in 10 seconds"],\n  "industryContext": "when appropriate, 1-2 paragraphs on comparable clubs/deals, market trends, or capital investment context that a knowledgeable golf-industry analyst would add. Leave as an empty string if there is genuinely no relevant context to add — do not pad.",\n  "entities": { "clubs": ["club or course names mentioned, if any"], "companies": ["company/vendor names mentioned, if any"], "people": ["full person names mentioned, if any"] },\n  "location": { "city": "city name or null", "state": "state name or null" }\n}`;

/**
 * Processes a raw RSS item into ClubFlow's full executive-briefing format (dek,
 * executive summary, what happened, why it matters, key takeaways, industry
 * context) plus candidate entity/location extraction for the Intelligence Graph.
 * Never throws — returns null on any failure (no API key, API error,
 * malformed/invalid response) so callers can fail soft per article.
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
      temperature: 0.3,
      max_tokens: 1600,
      messages: [
        { role: "system", content: EDITORIAL_SYSTEM_PROMPT },
        { role: "user", content: EDITORIAL_USER_PROMPT_TEMPLATE(input) }
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

export const articleAiActions = [
  "expand",
  "rewrite",
  "shorten",
  "improve_headline",
  "improve_executive_summary",
  "improve_why_it_matters"
] as const;

export type ArticleAiAction = (typeof articleAiActions)[number];

const actionInstructions: Record<ArticleAiAction, string> = {
  expand: "Expand this text with additional relevant detail and analysis, in the same voice. Do not invent specific facts not implied by the text — expand through analysis and context, not fabricated specifics.",
  rewrite: "Rewrite this text to be clearer and more polished, keeping the same meaning, facts, and approximate length.",
  shorten: "Shorten this text to its most essential points while preserving all key facts and meaning.",
  improve_headline: "Rewrite this as a sharper, more specific headline in the style of a premium trade publication (Bloomberg/The Information style) — concrete, not clickbait, under 90 characters.",
  improve_executive_summary: "Rewrite this executive summary so a senior club executive understands the full story in 2-3 short paragraphs.",
  improve_why_it_matters: "Rewrite this 'why it matters' section to sharpen the analysis for club executives, GMs, owners, developers, investors, architects, and operators — focus on operating, capital, competitive, or talent implications."
};

/**
 * On-demand AI editing assist for the admin article editor (Expand/Rewrite/Shorten/
 * Improve Headline/Improve Executive Summary/Improve Why It Matters). Returns only a
 * suggested replacement string — callers must let an editor review and explicitly
 * apply it; this function never writes to the database. Never throws — returns null
 * on any failure so the editor UI can show a clear "couldn't generate a suggestion"
 * state instead of crashing.
 */
export async function transformArticleText(input: {
  action: ArticleAiAction;
  text: string;
  title?: string;
}): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;
  if (!input.text.trim() && input.action !== "improve_headline") return null;

  try {
    const response = await client.chat.completions.create({
      model: getOpenAIModel(),
      temperature: 0.3,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You are ClubFlow's editorial AI assistant, helping an editor revise an executive briefing for the private golf club industry. Stay strictly scoped to golf/private-club content. Respond with only the revised text — no preamble, no labels, no quotation marks around it."
        },
        {
          role: "user",
          content: `${actionInstructions[input.action]}\n\nArticle headline: ${input.title ?? "Untitled"}\n\nText:\n${input.text}`
        }
      ]
    });

    const raw = response.choices[0]?.message?.content?.trim();
    return raw || null;
  } catch (error) {
    console.error("[openai] transformArticleText failed:", error);
    return null;
  }
}
