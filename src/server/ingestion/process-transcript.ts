import {
  decideMemoryCandidate,
  memoryCandidateSchema,
  type MemoryCandidate,
} from '@/domain/memory';
import { transcriptInputSchema, type TranscriptInput } from '@/schemas/transcript';
import { recordMemoryDecision, recordNoMemoryDecision } from '@/server/memory/memory-repository';
import { insertTranscript } from '@/server/ingestion/transcript-repository';

export async function processTranscript(input: {
  transcript: TranscriptInput;
  candidate: MemoryCandidate;
  excerpt: string;
  subjectKey?: string;
  modelRun?: {
    provider: string;
    model: string;
    latencyMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
    estimatedCostUsd: number | null;
  };
}) {
  const transcript = transcriptInputSchema.parse(input.transcript);
  const candidate = memoryCandidateSchema.parse(input.candidate);
  const storedTranscript = await insertTranscript(transcript);
  const decision = decideMemoryCandidate(candidate);
  const memoryId = await recordMemoryDecision({
    candidate,
    decision,
    transcriptId: storedTranscript.id,
    excerpt: input.excerpt,
    ...(input.subjectKey === undefined ? {} : { subjectKey: input.subjectKey }),
    ...(input.modelRun === undefined ? {} : { modelRun: input.modelRun }),
  });

  return { transcriptId: storedTranscript.id, memoryId, decision };
}

export async function processTranscriptCandidates(input: {
  transcript: TranscriptInput;
  candidates: Array<{ candidate: MemoryCandidate; excerpt: string }>;
  subjectKey?: string;
  emptyReason?: string;
  modelRun: {
    provider: string;
    model: string;
    latencyMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
    estimatedCostUsd: number | null;
  };
}) {
  const transcript = transcriptInputSchema.parse(input.transcript);
  const storedTranscript = await insertTranscript(transcript);
  const results = [];
  if (input.candidates.length === 0) {
    await recordNoMemoryDecision({
      transcriptId: storedTranscript.id,
      reason: input.emptyReason ?? 'No explicit memory candidate was extracted.',
      modelRun: input.modelRun,
    });
  }
  for (const item of input.candidates) {
    const candidate = memoryCandidateSchema.parse(item.candidate);
    const decision = decideMemoryCandidate(candidate);
    const memoryId = await recordMemoryDecision({
      candidate,
      decision,
      transcriptId: storedTranscript.id,
      excerpt: item.excerpt,
      ...(input.subjectKey === undefined ? {} : { subjectKey: input.subjectKey }),
      modelRun: input.modelRun,
    });
    results.push({ memoryId, decision });
  }
  return { transcriptId: storedTranscript.id, results };
}
