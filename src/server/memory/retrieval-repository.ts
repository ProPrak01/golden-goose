import type { RetrievalCandidate } from '@/domain/retrieval';
import { scoreLexicalRelevance } from '@/domain/retrieval';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

export async function listRetrievalCandidates(query: string): Promise<RetrievalCandidate[]> {
  const { data, error } = await getDatabaseClient()
    .from('memories')
    .select('id, canonical_statement, confidence, status, memory_evidence(id)')
    .eq('status', 'active');
  if (error) throw new RepositoryError('list retrieval candidates', error.message);

  return data.map((memory) => ({
    id: memory.id,
    statement: memory.canonical_statement,
    status: 'active',
    confidence: Number(memory.confidence),
    lexicalScore: scoreLexicalRelevance(query, memory.canonical_statement),
    evidenceCount: memory.memory_evidence.length,
  }));
}
