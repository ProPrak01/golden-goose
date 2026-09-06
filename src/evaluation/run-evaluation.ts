import { decideMemoryCandidate, type MemoryCandidate } from '@/domain/memory';
import { planAssistantResponse, type AssistantPlan } from '@/domain/assistant';
import { selectGroundedMemories, type RetrievalCandidate } from '@/domain/retrieval';

type RetrievalCase = {
  id: string;
  request: string;
  candidates: RetrievalCandidate[];
  expectedOutcome: AssistantPlan['outcome'];
  expectedSelectedIds: string[];
};

const activeDeadline: RetrievalCandidate = {
  id: 'controls-deadline',
  statement: 'The Controls assignment is due Friday.',
  status: 'active',
  confidence: 0.94,
  lexicalScore: 0.8,
  evidenceCount: 1,
};

const retrievalCases: RetrievalCase[] = [
  {
    id: 'supported-fact-answer',
    request: 'What is the Controls assignment deadline?',
    candidates: [activeDeadline],
    expectedOutcome: 'answered',
    expectedSelectedIds: ['controls-deadline'],
  },
  {
    id: 'planning-with-explicit-evidence',
    request: 'What should I do today?',
    candidates: [{ ...activeDeadline, lexicalScore: 0.01 }],
    expectedOutcome: 'answered',
    expectedSelectedIds: ['controls-deadline'],
  },
  {
    id: 'soft-expired-exclusion',
    request: 'What is the old deadline?',
    candidates: [{ ...activeDeadline, status: 'soft_expired', lexicalScore: 0.8 }],
    expectedOutcome: 'abstained',
    expectedSelectedIds: [],
  },
  {
    id: 'superseded-exclusion',
    request: 'What is the previous deadline?',
    candidates: [{ ...activeDeadline, status: 'superseded', lexicalScore: 0.8 }],
    expectedOutcome: 'abstained',
    expectedSelectedIds: [],
  },
  {
    id: 'weak-evidence-exclusion',
    request: 'What is the deadline?',
    candidates: [{ ...activeDeadline, confidence: 0.6 }],
    expectedOutcome: 'abstained',
    expectedSelectedIds: [],
  },
  {
    id: 'unrelated-request-abstention',
    request: 'What is my home address?',
    candidates: [{ ...activeDeadline, lexicalScore: 0 }],
    expectedOutcome: 'abstained',
    expectedSelectedIds: [],
  },
  {
    id: 'ambiguous-request-clarification',
    request: 'Help',
    candidates: [activeDeadline],
    expectedOutcome: 'clarified',
    expectedSelectedIds: ['controls-deadline'],
  },
];

const inferredTrait: MemoryCandidate = {
  memoryType: 'pattern',
  canonicalStatement: 'The user is lazy.',
  confidence: 0.95,
  evidenceCount: 1,
  isExplicit: false,
  isSensitiveInference: true,
};

export type EvaluationCaseResult = {
  id: string;
  expectedOutcome: string;
  actualOutcome: string;
  expectedSelectedIds: string[];
  actualSelectedIds: string[];
  passed: boolean;
};

export function runEvaluation() {
  const retrievalResults = retrievalCases.map((testCase) => {
    const retrieval = selectGroundedMemories(testCase.candidates);
    const plan = planAssistantResponse(testCase.request, retrieval);
    const actualSelectedIds =
      retrieval.kind === 'selected' ? retrieval.candidates.map(({ id }) => id) : [];
    return {
      id: testCase.id,
      expectedOutcome: testCase.expectedOutcome,
      actualOutcome: plan.outcome,
      expectedSelectedIds: testCase.expectedSelectedIds,
      actualSelectedIds,
      passed:
        plan.outcome === testCase.expectedOutcome &&
        actualSelectedIds.join(',') === testCase.expectedSelectedIds.join(','),
    } satisfies EvaluationCaseResult;
  });

  const policyDecision = decideMemoryCandidate(inferredTrait);
  const policyResult: EvaluationCaseResult = {
    id: 'inferred-trait-rejection',
    expectedOutcome: 'rejected',
    actualOutcome: policyDecision.kind === 'reject' ? 'rejected' : policyDecision.kind,
    expectedSelectedIds: [],
    actualSelectedIds: [],
    passed: policyDecision.kind === 'reject',
  };
  const cases = [...retrievalResults, policyResult];
  const passed = cases.filter((result) => result.passed).length;
  const abstentionCases = cases.filter((result) => result.expectedOutcome === 'abstained');

  return {
    summary: {
      totalCases: cases.length,
      passedCases: passed,
      passRate: passed / cases.length,
      groundedAnswerRate:
        cases.filter((result) => result.actualOutcome === 'answered').length / cases.length,
      correctAbstentionRate:
        abstentionCases.filter((result) => result.passed).length / abstentionCases.length,
      policyRejectionRate: policyResult.passed ? 1 : 0,
    },
    cases,
  };
}
