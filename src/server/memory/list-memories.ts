import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

export async function listActiveMemories() {
  const { data, error } = await getDatabaseClient()
    .from('memories')
    .select(
      'id, memory_type, canonical_statement, confidence, created_at, memory_evidence(excerpt, transcripts(occurred_at, source_app))',
    )
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw new RepositoryError('list active memories', error.message);
  return data;
}
