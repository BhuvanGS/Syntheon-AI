// lib/groq.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export interface SpecBlock {
  id:         string;
  title:      string;
  type:       "feature" | "idea" | "constraint" | "improvement";
  confidence: number;
  meeting_id: string;
  timestamp:  string;
}

export async function extractSpecBlocks(
  transcript: string,
  meetingId:  string
): Promise<SpecBlock[]> {

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an AI that extracts structured specification blocks from meeting transcripts.
Extract every idea, feature, constraint, or improvement discussed.
Capture ALL ideas — humans will decide what to implement.
Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences.`
      },
      {
        role: "user",
        content: `Extract spec blocks from this transcript:

${transcript}

Return a JSON array where each item has:
- id: unique string using this format: "${meetingId}-spec-1", "${meetingId}-spec-2", etc.
- title: short clear title of idea/feature/constraint
- type: one of "feature", "idea", "constraint", "improvement"
- confidence: number between 0 and 1
- meeting_id: "${meetingId}"
- timestamp: current ISO timestamp

Return ONLY JSON array, nothing else.`
      }
    ],
    temperature: 0.3,
    max_tokens:  2000
  });

  const raw = response.choices[0].message.content?.trim() ?? "";

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) throw new Error("Groq response is not an array");

    return parsed as SpecBlock[];
  } catch (err) {
    console.error("Failed to parse Groq response:", raw);
    throw new Error("Groq returned invalid JSON");
  }
}
