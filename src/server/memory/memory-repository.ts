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
  subjectKey?: string;
  modelRun?: {
    provider: string;
    model: string;
    latencyMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
  };
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
        subject_key: input.subjectKey ?? 'self',
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
    provider: input.modelRun?.provider ?? 'deterministic',
    model: input.modelRun?.model ?? null,
    latency_ms: input.modelRun?.latencyMs ?? null,
    input_tokens: input.modelRun?.inputTokens ?? null,
    output_tokens: input.modelRun?.outputTokens ?? null,
  });
  if (decisionError) throw new RepositoryError('record memory decision', decisionError.message);

  return memoryId;
}

/** Records an auditable non-memory outcome when an extractor emits no candidates. */
export async function recordNoMemoryDecision(input: {
  transcriptId: string;
  reason: string;
  modelRun: {
    provider: string;
    model: string;
    latencyMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
  };
}): Promise<void> {
  const { error } = await getDatabaseClient()
    .from('memory_decisions')
    .insert({
      memory_id: null,
      transcript_id: input.transcriptId,
      kind: 'rejected',
      reason: input.reason,
      decision_input: { type: 'no_memory_candidate' } as Json,
      provider: input.modelRun.provider,
      model: input.modelRun.model,
      latency_ms: input.modelRun.latencyMs,
      input_tokens: input.modelRun.inputTokens,
      output_tokens: input.modelRun.outputTokens,
    });
  if (error) throw new RepositoryError('record no-memory decision', error.message);
}
