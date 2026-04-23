import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ColumnMapping {
  sourceColumn: string;
  canonicalField: string | null;
  transformation: string;
  confidence: number;
  reasoning: string;
}

export async function normalizeSchema(
  rawHeaders: string[],
  sampleRows: Record<string, unknown>[],
  fileContext: string
): Promise<ColumnMapping[]> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a data schema normalization engine for a dance studio membership system (GetGrib, a Dutch membership platform).

Your job: map raw Excel column headers to a canonical schema. The source data is often in Dutch. Column names may be inconsistent between exports.

Canonical fields available:
memberId, firstName, lastName, email, phone, dateOfBirth, membershipType, membershipStatus, startDate, endDate, lastCheckIn, totalCheckIns, monthlyFee, outstandingBalance, danceStyle, level, notes

For attendance/check-in files, also consider: checkInDate, checkInTime, className, instructorName, attendeeCount

RULES:
- Return ONLY valid JSON array. No markdown, no explanation, no preamble.
- Map every source column to a canonical field or set canonicalField to null for unmapped.
- Normalize membership status values to: active, inactive, paused, cancelled.
- Normalize membership type values to: monthly, quarterly, annual, drop-in, trial (or keep original if no match).
- If uncertain about a mapping, include low confidence score (0-1) and your reasoning.`,
    messages: [
      {
        role: 'user',
        content: `Map these Excel columns to the canonical schema.

Source columns: ${JSON.stringify(rawHeaders)}

Sample data (first 5 rows):
${JSON.stringify(sampleRows, null, 2)}

File context: ${fileContext}

Return JSON array:
[
  {
    "sourceColumn": "original header name",
    "canonicalField": "canonical field name or null",
    "transformation": "description of any value transformation needed",
    "confidence": 0.95,
    "reasoning": "why this mapping"
  }
]`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
