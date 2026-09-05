export type RetrievalCandidate = {
  id: string;
  statement: string;
  status: 'active' | 'soft_expired' | 'superseded' | 'deleted';
  confidence: number;
  lexicalScore: number;
  evidenceCount: number;
};

export type RetrievalResult =
  | { kind: 'selected'; candidates: RetrievalCandidate[]; rationale: string }
  | { kind: 'abstain'; candidates: []; rationale: string };

export function selectGroundedMemories(candidates: readonly RetrievalCandidate[]): RetrievalResult {
  const selected = [...candidates]
    .filter(
      (candidate) =>
        candidate.status === 'active' &&
        candidate.confidence >= 0.7 &&
        candidate.evidenceCount > 0 &&
        candidate.lexicalScore > 0,
    )
    .sort((left, right) => right.lexicalScore - left.lexicalScore)
    .slice(0, 5);

  if (selected.length === 0) {
    return {
      kind: 'abstain',
      candidates: [],
      rationale: 'No active, sufficiently supported memory matches this request.',
    };
  }

  return {
    kind: 'selected',
    candidates: selected,
    rationale: 'Selected active memories with explicit evidence and relevant retrieval scores.',
  };
}
