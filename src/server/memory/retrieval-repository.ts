import type { RetrievalCandidate } from '@/domain/retrieval';
import { scoreLexicalRelevance } from '@/domain/retrieval';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import { createTextEmbedding, toPgVector } from '@/server/embeddings/provider';
import {
  developmentCorpusSubjectKey,
  evaluationFixtureSubjectKey,
  providerAuditReplaySubjectKey,
  sarvamSmokeSubjectKey,
} from '@/server/memory/scopes';

type RetrievalOptions = {
  includeEvaluationFixtures?: boolean;
  includeDevelopmentCorpus?: boolean;
  includeProviderAuditReplay?: boolean;
};

async function getSemanticScores(query: string) {
  const embedding = await createTextEmbedding(query);
  if (!embedding) return new Map<string, number>();

  const { data, error } = await getDatabaseClient().rpc('match_memory_embeddings', {
    query_embedding: toPgVector(embedding.vector),
    match_count: 20,
  });
  if (error) throw new RepositoryError('match memory embeddings', error.message);
  return new Map(data.map((match) => [match.id, match.similarity]));
}

export async function listRetrievalCandidates(
  query: string,
  {
    includeEvaluationFixtures = false,
    includeDevelopmentCorpus = false,
    includeProviderAuditReplay = false,
  }: RetrievalOptions = {},
): Promise<RetrievalCandidate[]> {
  const semanticScores = await getSemanticScores(query);
  let queryBuilder = getDatabaseClient()
    .from('memories')
    .select('id, canonical_statement, confidence, status, memory_evidence(id)')
    .eq('status', 'active');
  if (!includeEvaluationFixtures) {
    queryBuilder = queryBuilder.neq('subject_key', evaluationFixtureSubjectKey);
  }
  if (!includeDevelopmentCorpus) {
    queryBuilder = queryBuilder.neq('subject_key', developmentCorpusSubjectKey);
  }
  if (!includeProviderAuditReplay) {
    queryBuilder = queryBuilder.neq('subject_key', providerAuditReplaySubjectKey);
  }
  queryBuilder = queryBuilder.neq('subject_key', sarvamSmokeSubjectKey);
  const { data, error } = await queryBuilder;
  if (error) throw new RepositoryError('list retrieval candidates', error.message);

  return data.map((memory) => {
    const semanticScore = semanticScores.get(memory.id);
    return {
      id: memory.id,
      statement: memory.canonical_statement,
      status: 'active' as const,
      confidence: Number(memory.confidence),
      lexicalScore: scoreLexicalRelevance(query, memory.canonical_statement),
      ...(semanticScore === undefined ? {} : { semanticScore }),
      evidenceCount: memory.memory_evidence.length,
    };
  });
}
