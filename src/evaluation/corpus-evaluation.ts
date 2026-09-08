import { composeAssistantResponse, planAssistantResponse } from '@/domain/assistant';
import { selectGroundedMemories } from '@/domain/retrieval';
import { listRetrievalCandidates } from '@/server/memory/retrieval-repository';
import { developmentCorpusSubjectKey } from '@/server/memory/scopes';

const cases = [
  {
    id: 'corpus-algorithms-deadline',
    request: 'When is the Algorithms problem set due?',
    expectedOutcome: 'answered',
    requiredEvidence: 'Algorithms problem set',
  },
  {
    id: 'corpus-signals-history-retrieval',
    request: 'What should I do for Signals this week?',
    expectedOutcome: 'answered',
    requiredEvidence: 'Signals',
  },
  {
    id: 'corpus-unrelated-abstention',
    request: 'What is my home address?',
    expectedOutcome: 'abstained',
    requiredEvidence: undefined,
  },
  {
    id: 'corpus-short-request-clarification',
    request: 'Help',
    expectedOutcome: 'clarified',
    requiredEvidence: undefined,
  },
] as const;

export async function runCorpusEvaluation() {
  const results = await Promise.all(
    cases.map(async (testCase) => {
      const startedAt = performance.now();
      const candidates = await listRetrievalCandidates(testCase.request, {
        includeDevelopmentCorpus: true,
      });
      const retrieval = selectGroundedMemories(candidates);
      const plan = planAssistantResponse(testCase.request, retrieval);
      const response = composeAssistantResponse(plan, retrieval);
      const selected = retrieval.kind === 'selected' ? retrieval.candidates : [];
      const selectedStatements = selected.map((candidate) => candidate.statement);
      const passed =
        plan.outcome === testCase.expectedOutcome &&
        (testCase.requiredEvidence === undefined ||
          selectedStatements.some((statement) => statement.includes(testCase.requiredEvidence)));

      return {
        ...testCase,
        actualOutcome: plan.outcome,
        selectedStatements,
        response,
        latencyMs: Math.round(performance.now() - startedAt),
        passed,
      };
    }),
  );
  const passedCases = results.filter((result) => result.passed).length;

  return {
    summary: {
      corpusScope: developmentCorpusSubjectKey,
      totalCases: results.length,
      passedCases,
      passRate: passedCases / results.length,
      maxLatencyMs: Math.max(...results.map((result) => result.latencyMs)),
    },
    cases: results,
  };
}
