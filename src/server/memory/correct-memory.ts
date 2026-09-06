import { canTransitionMemory, memoryStatusSchema } from '@/domain/memory';
import type { MemoryCorrectionInput } from '@/schemas/memory-correction';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import { createTextEmbedding, toPgVector } from '@/server/embeddings/provider';

export async function correctMemory(memoryId: string, input: MemoryCorrectionInput) {
  const database = getDatabaseClient();
  const { data: memory, error: memoryError } = await database
    .from('memories')
    .select('id, memory_type, status, subject_key, confidence')
    .eq('id', memoryId)
    .maybeSingle();
  if (memoryError) throw new RepositoryError('load memory for correction', memoryError.message);
  if (!memory) return null;

  const currentStatus = memoryStatusSchema.parse(memory.status);
  if (!canTransitionMemory(currentStatus, 'superseded')) {
    throw new RepositoryError('correct memory', `cannot correct a ${currentStatus} memory`);
  }

  const { data: correctionTranscript, error: transcriptError } = await database
    .from('transcripts')
    .insert({
      occurred_at: input.occurredAt,
      source_app: 'User correction',
      raw_asr: input.canonicalStatement,
      formatted_text: input.canonicalStatement,
      context: { supersedes_memory_id: memoryId, correction_reason: input.detail },
    })
    .select('id')
    .single();
  if (transcriptError)
    throw new RepositoryError('record correction transcript', transcriptError.message);

  const embedding = await createTextEmbedding(input.canonicalStatement);
  const { data: correctedMemory, error: correctedMemoryError } = await database
    .from('memories')
    .insert({
      memory_type: memory.memory_type,
      status: 'active',
      subject_key: memory.subject_key,
      canonical_statement: input.canonicalStatement,
      confidence: memory.confidence,
      embedding: embedding ? toPgVector(embedding.vector) : null,
      embedding_provider: embedding?.provider ?? null,
      embedding_model: embedding?.model ?? null,
      embedding_updated_at: embedding ? new Date().toISOString() : null,
    })
    .select('id')
    .single();
  if (correctedMemoryError)
    throw new RepositoryError('create corrected memory', correctedMemoryError.message);

  const { error: evidenceError } = await database.from('memory_evidence').insert({
    memory_id: correctedMemory.id,
    transcript_id: correctionTranscript.id,
    excerpt: input.canonicalStatement,
    rationale: `User correction: ${input.detail}`,
  });
  if (evidenceError) throw new RepositoryError('record correction evidence', evidenceError.message);

  const { error: supersedeError } = await database
    .from('memories')
    .update({
      status: 'superseded',
      superseded_by: correctedMemory.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memoryId);
  if (supersedeError)
    throw new RepositoryError('supersede previous memory', supersedeError.message);

  const { error: oldDecisionError } = await database.from('memory_decisions').insert({
    memory_id: memoryId,
    transcript_id: correctionTranscript.id,
    kind: 'superseded',
    reason: input.detail,
  });
  if (oldDecisionError)
    throw new RepositoryError('record supersession decision', oldDecisionError.message);

  const { error: correctionDecisionError } = await database.from('memory_decisions').insert({
    memory_id: correctedMemory.id,
    transcript_id: correctionTranscript.id,
    kind: 'corrected',
    reason: input.detail,
  });
  if (correctionDecisionError) {
    throw new RepositoryError('record correction decision', correctionDecisionError.message);
  }

  const { error: feedbackError } = await database.from('user_feedback').insert({
    memory_id: memoryId,
    action: 'corrected',
    detail: input.detail,
    replacement_statement: input.canonicalStatement,
  });
  if (feedbackError) throw new RepositoryError('record correction feedback', feedbackError.message);

  return { previousMemoryId: memoryId, correctedMemoryId: correctedMemory.id };
}
