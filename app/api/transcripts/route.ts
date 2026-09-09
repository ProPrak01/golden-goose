import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processTranscript } from '@/server/ingestion/process-transcript';

const requestSchema = z.object({
  transcript: z.object({
    occurredAt: z.string(),
    sourceApp: z.string().optional(),
    rawAsr: z.string(),
    formattedText: z.string(),
    context: z.record(z.string(), z.unknown()).default({}),
  }),
  candidate: z.object({
    memoryType: z.enum(['fact', 'preference', 'episode', 'pattern']),
    canonicalStatement: z.string(),
    confidence: z.number(),
    evidenceCount: z.number().int(),
    isExplicit: z.boolean(),
    isSensitiveInference: z.boolean(),
  }),
  excerpt: z.string().min(1),
  modelRun: z
    .object({
      provider: z.string().min(1),
      model: z.string().min(1),
      latencyMs: z.number().int().nonnegative(),
      inputTokens: z.number().int().nonnegative().nullable(),
      outputTokens: z.number().int().nonnegative().nullable(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { modelRun, ...requestData } = parsed.data;
  const result = await processTranscript({
    ...requestData,
    ...(modelRun === undefined ? {} : { modelRun }),
  });
  return NextResponse.json(result, { status: 201 });
}
