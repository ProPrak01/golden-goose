import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

export async function getMemoryForCorrection(memoryId: string) {
  const { data, error } = await getDatabaseClient()
    .from('memories')
    .select('id, memory_type, canonical_statement, status, confidence')
    .eq('id', memoryId)
    .maybeSingle();
  if (error) throw new RepositoryError('load memory for correction view', error.message);
  return data;
}
