export interface ColumnMapping {
  sourceColumn: string;
  canonicalField: string | null;
  transformation: string;
  confidence: number;
  reasoning: string;
}

// Dutch → canonical field rules. Entries are [pattern, canonicalField, transformation].
const RULES: [RegExp, string, string][] = [
  [/lid\s*n[ro]\.?|lidnummer|member\s*id|nummer/i, 'memberId', 'none'],
  [/voornaam|first\s*name|naam\s*1/i, 'firstName', 'none'],
  [/achternaam|familienaam|last\s*name|naam\s*2/i, 'lastName', 'none'],
  [/e[\s-]?mail/i, 'email', 'lowercase'],
  [/telefoon|mobiel|tel\.?|phone/i, 'phone', 'normalize phone number'],
  [/geboortedatum|datum\s*geboorte|birth|dob/i, 'dateOfBirth', 'parse date to ISO'],
  [/type\s*lid|abonnement|membership\s*type|soort/i, 'membershipType', 'normalize: monthly|quarterly|annual|drop-in|trial'],
  [/status/i, 'membershipStatus', 'normalize: active|inactive|paused|cancelled'],
  [/start\s*datum|ingangsdatum|start\s*date|begindatum/i, 'startDate', 'parse date to ISO'],
  [/eind\s*datum|vervaldatum|end\s*date|verloopdatum/i, 'endDate', 'parse date to ISO'],
  [/laatste\s*(check.?in|bezoek|aanw)/i, 'lastCheckIn', 'parse date to ISO'],
  [/totaal\s*(bezoeken|check.?ins|aanw)|aantal\s*bezoeken/i, 'totalCheckIns', 'parse integer'],
  [/maandelijks?\s*(bedrag|prijs|tarief)|abonnements\s*prijs|monthly\s*fee/i, 'monthlyFee', 'parse float, strip currency symbol'],
  [/openstaand|schuld|outstanding|balance|saldo/i, 'outstandingBalance', 'parse float, strip currency symbol'],
  [/dans\s*stijl|stijl|dance\s*style/i, 'danceStyle', 'none'],
  [/niveau|level/i, 'level', 'none'],
  [/notities?|opmerkingen|remarks|notes/i, 'notes', 'none'],
  // Attendance fields
  [/check.?in\s*datum|aanwezig\s*datum|date/i, 'checkInDate', 'parse date to ISO'],
  [/check.?in\s*tijd|tijdstip|time/i, 'checkInTime', 'parse time HH:mm'],
  [/klas\s*naam|les\s*naam|class\s*name|cursus/i, 'className', 'none'],
  [/instructeur|docent|trainer|instructor/i, 'instructorName', 'none'],
  [/aantal\s*(deeln|aanw|leden)|attendees|participants/i, 'attendeeCount', 'parse integer'],
];

function ruleBasedMap(rawHeaders: string[], sampleRows: Record<string, unknown>[]): ColumnMapping[] {
  return rawHeaders.map((col) => {
    const normalized = col.trim().toLowerCase();
    for (const [pattern, field, transformation] of RULES) {
      if (pattern.test(normalized)) {
        return {
          sourceColumn: col,
          canonicalField: field,
          transformation,
          confidence: 0.9,
          reasoning: `Matched Dutch/English pattern for ${field}`,
        };
      }
    }
    // Fallback: check sample values for hints
    const sampleValues = sampleRows.map((r) => String(r[col] ?? '')).filter(Boolean);
    const firstVal = sampleValues[0] ?? '';
    if (/^\d{4}-\d{2}-\d{2}|^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(firstVal)) {
      return { sourceColumn: col, canonicalField: null, transformation: 'looks like a date', confidence: 0.3, reasoning: 'sample values look like dates but column name unrecognized' };
    }
    if (/^[\d,.]+$/.test(firstVal) && sampleValues.length > 0) {
      return { sourceColumn: col, canonicalField: null, transformation: 'numeric', confidence: 0.2, reasoning: 'numeric column, name unrecognized' };
    }
    return { sourceColumn: col, canonicalField: null, transformation: 'none', confidence: 0, reasoning: 'no matching pattern found' };
  });
}

async function aiMap(rawHeaders: string[], sampleRows: Record<string, unknown>[], fileContext: string): Promise<ColumnMapping[] | null> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.minimaxi.chat/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: `You are a data schema normalization engine for a dance studio membership system (GetGrib, a Dutch membership platform).

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
          },
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
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';
    // Strip <think>...</think> reasoning blocks emitted by MiniMax-M2.7
    const noThink = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const cleaned = noThink.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function normalizeSchema(
  rawHeaders: string[],
  sampleRows: Record<string, unknown>[],
  fileContext: string
): Promise<ColumnMapping[]> {
  // Try AI first; fall back to rule-based if unavailable or plan doesn't support it
  const aiResult = await aiMap(rawHeaders, sampleRows, fileContext);
  if (aiResult) return aiResult;
  return ruleBasedMap(rawHeaders, sampleRows);
}
