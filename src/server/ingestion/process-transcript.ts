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
  });

  return { transcriptId: storedTranscript.id, memoryId, decision };
}
