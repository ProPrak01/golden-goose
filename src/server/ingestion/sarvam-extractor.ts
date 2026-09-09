import { getServerEnvironment } from '@/env';
import { memoryExtractionSchema, type MemoryExtraction } from '@/schemas/memory-extraction';

type ExtractionResult = {
  extraction: MemoryExtraction;
  provider: 'sarvam';
  model: 'sarvam-105b';
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
};

export async function extractMemoriesWithSarvam(
  formattedText: string,
  attempt = 0,
): Promise<ExtractionResult> {
  const environment = getServerEnvironment();
  if (environment.LLM_PROVIDER !== 'sarvam' || !environment.SARVAM_API) {
    throw new Error('Sarvam extraction requires LLM_PROVIDER=sarvam and SARVAM_API.');
  }

  const startedAt = performance.now();
  const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'api-subscription-key': environment.SARVAM_API, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'sarvam-105b',
      temperature: 0,
      max_tokens: 700,
      messages: [
        {
          role: 'system',
          content:
            'Extract at most three durable academic-continuity memory candidates from the supplied transcript. Qualifying candidates include explicitly stated course deadlines, scores, task commitments, explicit study preferences, and explicitly described past academic episodes or lessons. A first-person statement such as "My Signals quiz is due Friday" is an explicit fact; "I prefer two focused study blocks" is an explicit preference. Do not require an externally verifiable source. Do not infer emotion, personality, motivation, competence, or unstated causes. Every excerpt must be a verbatim span from the transcript. Return one JSON object with exactly two keys: candidates (an array of objects containing memoryType, canonicalStatement, excerpt, confidence, isExplicit, and isSensitiveInference) and reason (a short string). If nothing qualifies, candidates must be an empty array.',
        },
        { role: 'user', content: formattedText },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) throw new Error(`Sarvam extraction failed with HTTP ${response.status}.`);
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    if (attempt === 0) return extractMemoriesWithSarvam(formattedText, 1);
    throw new Error('Sarvam returned no structured extraction content after one retry.');
  }
  let parsedContent: unknown;
  try {
    parsedContent = JSON.parse(content);
  } catch {
    throw new Error('Sarvam returned invalid JSON for memory extraction.');
  }
  const extraction = memoryExtractionSchema.safeParse(parsedContent);
  if (!extraction.success) {
    if (attempt === 0) return extractMemoriesWithSarvam(formattedText, 1);
    throw new Error(`Sarvam returned an invalid memory extraction: ${extraction.error.message}`);
  }
  return {
    extraction: extraction.data,
    provider: 'sarvam',
    model: 'sarvam-105b',
    latencyMs: Math.round(performance.now() - startedAt),
    inputTokens: payload.usage?.prompt_tokens ?? null,
    outputTokens: payload.usage?.completion_tokens ?? null,
  };
}
