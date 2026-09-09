import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import {
  developmentCorpusSubjectKey,
  evaluationFixtureSubjectKey,
  sarvamSmokeSubjectKey,
} from '@/server/memory/scopes';

export async function listActiveMemories() {
  const { data, error } = await getDatabaseClient()
    .from('memories')
    .select(
      'id, memory_type, canonical_statement, confidence, created_at, memory_evidence(excerpt, transcripts(occurred_at, source_app))',
    )
    .eq('status', 'active')
    .neq('subject_key', evaluationFixtureSubjectKey)
    .neq('subject_key', developmentCorpusSubjectKey)
    .neq('subject_key', sarvamSmokeSubjectKey)
    .order('created_at', { ascending: false });
  if (error) throw new RepositoryError('list active memories', error.message);
  return data;
}
