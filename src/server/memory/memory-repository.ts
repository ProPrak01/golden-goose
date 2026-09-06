import type { Json } from '@/generated/database.types';
import type { MemoryCandidate, MemoryDecision } from '@/domain/memory';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import { createTextEmbedding, toPgVector } from '@/server/embeddings/provider';

export async function recordMemoryDecision(input: {
  candidate: MemoryCandidate;
  decision: MemoryDecision;
  transcriptId: string;
  excerpt: string;
}): Promise<string | null> {
  const database = getDatabaseClient();
  let memoryId: string | null = null;

  if (input.decision.kind === 'accept') {
    const embedding = await createTextEmbedding(input.candidate.canonicalStatement);
    const { data, error } = await database
      .from('memories')
      .insert({
        memory_type: input.candidate.memoryType,
        status: input.decision.nextStatus,
        canonical_statement: input.candidate.canonicalStatement,
        confidence: input.candidate.confidence,
        embedding: embedding ? toPgVector(embedding.vector) : null,
        embedding_provider: embedding?.provider ?? null,
        embedding_model: embedding?.model ?? null,
        embedding_updated_at: embedding ? new Date().toISOString() : null,
      })
      .select('id')
      .single();
    if (error) throw new RepositoryError('create memory', error.message);
    memoryId = data.id;

    const { error: evidenceError } = await database.from('memory_evidence').insert({
      memory_id: memoryId,
      transcript_id: input.transcriptId,
      excerpt: input.excerpt,
      rationale: input.decision.reason,
    });
    if (evidenceError) throw new RepositoryError('record memory evidence', evidenceError.message);
  }

  const { error: decisionError } = await database.from('memory_decisions').insert({
    memory_id: memoryId,
    transcript_id: input.transcriptId,
    kind: input.decision.kind === 'accept' ? 'created' : 'rejected',
    reason: input.decision.reason,
    decision_input: input.candidate as unknown as Json,
  });
  if (decisionError) throw new RepositoryError('record memory decision', decisionError.message);

  return memoryId;
}
