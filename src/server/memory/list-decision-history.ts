import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

export async function listDecisionHistory() {
  const { data, error } = await getDatabaseClient()
    .from('memory_decisions')
    .select(
      'id, kind, reason, provider, model, latency_ms, created_at, memories(canonical_statement, status), transcripts(formatted_text, occurred_at, source_app)',
    )
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new RepositoryError('list decision history', error.message);
  return data;
}
