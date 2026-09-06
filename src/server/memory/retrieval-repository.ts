import type { RetrievalCandidate } from '@/domain/retrieval';
import { scoreLexicalRelevance } from '@/domain/retrieval';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import { createTextEmbedding, toPgVector } from '@/server/embeddings/provider';

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

export async function listRetrievalCandidates(query: string): Promise<RetrievalCandidate[]> {
  const semanticScores = await getSemanticScores(query);
  const { data, error } = await getDatabaseClient()
    .from('memories')
    .select('id, canonical_statement, confidence, status, memory_evidence(id)')
    .eq('status', 'active');
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
