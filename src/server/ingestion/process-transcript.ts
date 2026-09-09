import {
  decideMemoryCandidate,
  memoryCandidateSchema,
  type MemoryCandidate,
} from '@/domain/memory';
import { transcriptInputSchema, type TranscriptInput } from '@/schemas/transcript';
import { recordMemoryDecision } from '@/server/memory/memory-repository';
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
  modelRun: {
    provider: string;
    model: string;
    latencyMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
  };
}) {
  const transcript = transcriptInputSchema.parse(input.transcript);
  const storedTranscript = await insertTranscript(transcript);
  const results = [];
  for (const item of input.candidates) {
    const candidate = memoryCandidateSchema.parse(item.candidate);
    const decision = decideMemoryCandidate(candidate);
    const memoryId = await recordMemoryDecision({
      candidate,
      decision,
      transcriptId: storedTranscript.id,
      excerpt: item.excerpt,
      modelRun: input.modelRun,
    });
    results.push({ memoryId, decision });
  }
  return { transcriptId: storedTranscript.id, results };
}
