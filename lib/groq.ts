// lib/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export interface SpecBlock {
  id: string;
  title: string;
  type: 'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp: string;
}

export async function extractSpecBlocks(
  transcript: string,
  meetingId: string
): Promise<{ specs: SpecBlock[]; title: string }> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an AI that extracts structured specification blocks from meeting transcripts.
Extract every idea, feature, constraint, or improvement discussed.
Also generate a short human-readable title for this meeting (max 5 words).
Respond ONLY with valid JSON. No markdown, no explanation, no code fences.`,
      },
      {
        role: 'user',
        content: `Extract spec blocks and generate a title from this transcript:

${transcript}

Return JSON in this exact format:
{
  "title": "Calculator App Discussion",
  "specs": [
    {
      "id": "${meetingId}-spec-1",
      "title": "short clear title",
      "type": "feature",
      "confidence": 0.92,
      "meeting_id": "${meetingId}",
      "timestamp": "2026-03-22T09:00:00.000Z"
    }
  ]
}

Return ONLY the JSON object, nothing else.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed.specs)) throw new Error('specs must be an array');
    return {
      title: parsed.title || 'Untitled Meeting',
      specs: parsed.specs as SpecBlock[],
    };
  } catch (err) {
    console.error('Failed to parse Groq response:', raw);
    throw new Error('Groq returned invalid JSON');
  }
}
