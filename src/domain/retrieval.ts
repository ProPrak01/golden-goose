export type RetrievalCandidate = {
  id: string;
  statement: string;
  status: 'active' | 'soft_expired' | 'superseded' | 'deleted';
  confidence: number;
  lexicalScore: number;
  semanticScore?: number;
  evidenceCount: number;
};

export type RetrievalResult =
  | { kind: 'selected'; candidates: RetrievalCandidate[]; rationale: string }
  | { kind: 'abstain'; candidates: []; rationale: string };

const planningTerms = new Set(['action', 'do', 'help', 'next', 'plan', 'should', 'today']);
const nonDiscriminatingTerms = new Set([
  'a',
  'assessment',
  'an',
  'assignment',
  'are',
  'due',
  'i',
  'is',
  'my',
  'homework',
  'quiz',
  'report',
  'task',
  'the',
  'was',
  'were',
  'what',
  'when',
]);

function tokenize(value: string) {
  return (value.toLocaleLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (term) => !nonDiscriminatingTerms.has(term),
  );
}

export function scoreLexicalRelevance(query: string, statement: string) {
  const queryTerms = new Set(tokenize(query));
  const statementTerms = new Set(tokenize(statement));
  const sharedTerms = [...queryTerms].filter((term) => statementTerms.has(term));

  if (sharedTerms.length > 0) return sharedTerms.length / queryTerms.size;
  if (
    (query.toLocaleLowerCase().match(/[a-z0-9]+/g) ?? []).some((term) => planningTerms.has(term))
  ) {
    return 0.01;
  }
  return 0;
}

export function selectGroundedMemories(candidates: readonly RetrievalCandidate[]): RetrievalResult {
  const eligible = [...candidates].filter(
    (candidate) =>
      candidate.status === 'active' &&
      candidate.confidence >= 0.7 &&
      candidate.evidenceCount > 0 &&
      (candidate.lexicalScore > 0 || (candidate.semanticScore ?? 0) > 0.2),
  );
  const hasSpecificMatch = eligible.some(
    (candidate) => Math.max(candidate.lexicalScore, candidate.semanticScore ?? 0) > 0.01,
  );
  const ranked = eligible
    .filter(
      (candidate) =>
        !hasSpecificMatch || Math.max(candidate.lexicalScore, candidate.semanticScore ?? 0) > 0.01,
    )
    .sort(
      (left, right) =>
        Math.max(right.lexicalScore, right.semanticScore ?? 0) -
        Math.max(left.lexicalScore, left.semanticScore ?? 0),
    )
    .slice(0, 20);
  const selected = [
    ...new Map(ranked.map((candidate) => [candidate.statement, candidate])).values(),
  ].slice(0, 5);

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
    rationale:
      'Selected active memories with explicit evidence and relevant lexical or semantic scores.',
  };
}
