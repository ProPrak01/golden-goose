import { canTransitionMemory, memoryStatusSchema } from '@/domain/memory';
import type { MemoryControlInput } from '@/schemas/memory-control';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

const targetStatus = {
  soft_expire: 'soft_expired',
  delete: 'deleted',
} as const;

export async function controlMemory(memoryId: string, input: MemoryControlInput) {
  const database = getDatabaseClient();
  const { data: memory, error: memoryError } = await database
    .from('memories')
    .select('id, status')
    .eq('id', memoryId)
    .maybeSingle();
  if (memoryError) throw new RepositoryError('load memory for control', memoryError.message);
  if (!memory) return null;

  const nextStatus = targetStatus[input.action];
  const currentStatus = memoryStatusSchema.parse(memory.status);
  if (!canTransitionMemory(currentStatus, nextStatus)) {
    throw new RepositoryError(
      'change memory status',
      `cannot transition from ${currentStatus} to ${nextStatus}`,
    );
  }

  const { error: updateError } = await database
    .from('memories')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', memoryId);
  if (updateError) throw new RepositoryError('change memory status', updateError.message);

  const detail = input.detail || `User marked this memory as ${nextStatus}.`;
  const decisionKind = input.action === 'delete' ? 'deleted' : 'soft_expired';
  const { error: decisionError } = await database.from('memory_decisions').insert({
    memory_id: memoryId,
    kind: decisionKind,
    reason: detail,
  });
  if (decisionError)
    throw new RepositoryError('record memory control decision', decisionError.message);

  const { error: feedbackError } = await database.from('user_feedback').insert({
    memory_id: memoryId,
    action: input.action === 'delete' ? 'deleted' : 'soft_expired',
    detail,
  });
  if (feedbackError)
    throw new RepositoryError('record memory control feedback', feedbackError.message);

  return { id: memoryId, status: nextStatus };
}
