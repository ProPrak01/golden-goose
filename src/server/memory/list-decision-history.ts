import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import { developmentCorpusSourceApp } from '@/server/memory/scopes';

export async function listDecisionHistory() {
  const { data, error } = await getDatabaseClient()
    .from('memory_decisions')
    .select(
      'id, kind, reason, provider, model, latency_ms, created_at, memories(canonical_statement, status), transcripts(formatted_text, occurred_at, source_app)',
    )
    .order('created_at', { ascending: false })
    .limit(600);
  if (error) throw new RepositoryError('list decision history', error.message);
  return data
    .filter((decision) => {
      const sourceApp = decision.transcripts?.source_app;
      return sourceApp !== developmentCorpusSourceApp && sourceApp !== 'Evaluation fixture';
    })
    .slice(0, 50);
}
