import { composeAssistantResponse, planAssistantResponse } from '@/domain/assistant';
import {
  scoreLexicalRelevance,
  selectGroundedMemories,
  type RetrievalCandidate,
} from '@/domain/retrieval';

type ScenarioMemory = Omit<RetrievalCandidate, 'lexicalScore'>;

type RetrievalScenario = {
  id: string;
  category: 'grounded-planning' | 'stale-exclusion' | 'conflict-exclusion' | 'abstention';
  turns: readonly string[];
  request: string;
  memories: readonly ScenarioMemory[];
  expectedOutcome: 'answered' | 'abstained';
  expectedMemoryIds: readonly string[];
  expectedResponseIncludes?: string;
};

const scenarios: readonly RetrievalScenario[] = [
  {
    id: 'signals-preparation-uses-deadline-episode-and-preference',
    category: 'grounded-planning',
    turns: [
      'My Signals quiz is Friday.',
      'Last Signals quiz, I rushed revision because I started the night before.',
      'For Signals, I prefer two focused study blocks before an assessment.',
    ],
    request: 'What should I do for Signals this week?',
    memories: [
      {
        id: 'signals-deadline',
        statement: 'The Signals quiz is Friday.',
        status: 'active',
        confidence: 0.95,
        evidenceCount: 1,
      },
      {
        id: 'signals-episode',
        statement:
          'The user explicitly reported rushing Signals revision after starting the night before.',
        status: 'active',
        confidence: 0.9,
        evidenceCount: 1,
      },
      {
        id: 'signals-preference',
        statement:
          'The user explicitly prefers two focused study blocks before a Signals assessment.',
        status: 'active',
        confidence: 0.9,
        evidenceCount: 1,
      },
    ],
    expectedOutcome: 'answered',
    expectedMemoryIds: ['signals-deadline', 'signals-episode', 'signals-preference'],
    expectedResponseIncludes: 'focused study blocks',
  },
  {
    id: 'specific-question-excludes-unrelated-planning-memory',
    category: 'grounded-planning',
    turns: ['My Algorithms problem set is due Monday.', 'My Networks lab report is due Thursday.'],
    request: 'When is the Algorithms problem set due?',
    memories: [
      {
        id: 'algorithms-deadline',
        statement: 'The Algorithms problem set is due Monday.',
        status: 'active',
        confidence: 0.94,
        evidenceCount: 1,
      },
      {
        id: 'networks-deadline',
        statement: 'The Networks lab report is due Thursday.',
        status: 'active',
        confidence: 0.94,
        evidenceCount: 1,
      },
    ],
    expectedOutcome: 'answered',
    expectedMemoryIds: ['algorithms-deadline'],
    expectedResponseIncludes: 'Algorithms problem set',
  },
  {
    id: 'soft-expired-deadline-is-not-used',
    category: 'stale-exclusion',
    turns: ['The old Data Systems assignment deadline was Wednesday.'],
    request: 'When is the Data Systems assignment due?',
    memories: [
      {
        id: 'old-data-systems-deadline',
        statement: 'The Data Systems assignment is due Wednesday.',
        status: 'soft_expired',
        confidence: 0.95,
        evidenceCount: 1,
      },
    ],
    expectedOutcome: 'abstained',
    expectedMemoryIds: [],
  },
  {
    id: 'superseded-deadline-is-excluded-in-favour-of-current-memory',
    category: 'conflict-exclusion',
    turns: [
      'The Linear Algebra assignment was due Thursday.',
      'The Linear Algebra assignment deadline changed to Friday.',
    ],
    request: 'When is the Linear Algebra assignment due?',
    memories: [
      {
        id: 'linear-algebra-old-deadline',
        statement: 'The Linear Algebra assignment is due Thursday.',
        status: 'superseded',
        confidence: 0.95,
        evidenceCount: 1,
      },
      {
        id: 'linear-algebra-current-deadline',
        statement: 'The Linear Algebra assignment is due Friday.',
        status: 'active',
        confidence: 0.95,
        evidenceCount: 1,
      },
    ],
    expectedOutcome: 'answered',
    expectedMemoryIds: ['linear-algebra-current-deadline'],
    expectedResponseIncludes: 'Friday',
  },
  {
    id: 'unsupported-request-abstains-without-a-personal-claim',
    category: 'abstention',
    turns: ['My Operating Systems project is due Friday.'],
    request: 'What is my home address?',
    memories: [
      {
        id: 'operating-systems-deadline',
        statement: 'The Operating Systems project is due Friday.',
        status: 'active',
        confidence: 0.95,
        evidenceCount: 1,
      },
    ],
    expectedOutcome: 'abstained',
    expectedMemoryIds: [],
  },
  {
    id: 'weak-memory-does-not-create-a-recommendation',
    category: 'abstention',
    turns: ['Maybe the Machine Learning tutorial is on Tuesday.'],
    request: 'When is the Machine Learning tutorial?',
    memories: [
      {
        id: 'weak-machine-learning-tutorial',
        statement: 'The Machine Learning tutorial is on Tuesday.',
        status: 'active',
        confidence: 0.45,
        evidenceCount: 1,
      },
    ],
    expectedOutcome: 'abstained',
    expectedMemoryIds: [],
  },
] as const;

export function runRetrievalScenarioEvaluation() {
  const cases = scenarios.map((scenario) => {
    const retrieval = selectGroundedMemories(
      scenario.memories.map((memory) => ({
        ...memory,
        lexicalScore: scoreLexicalRelevance(scenario.request, memory.statement),
      })),
    );
    const plan = planAssistantResponse(scenario.request, retrieval);
    const response = composeAssistantResponse(plan, retrieval);
    const selectedIds =
      retrieval.kind === 'selected' ? retrieval.candidates.map(({ id }) => id) : [];
    const passed =
      plan.outcome === scenario.expectedOutcome &&
      selectedIds.join(',') === scenario.expectedMemoryIds.join(',') &&
      (scenario.expectedResponseIncludes === undefined ||
        response.includes(scenario.expectedResponseIncludes));

    return {
      ...scenario,
      actualOutcome: plan.outcome,
      selectedIds,
      response,
      passed,
    };
  });
  const passedCases = cases.filter((testCase) => testCase.passed).length;
  const answeredCases = cases.filter((testCase) => testCase.actualOutcome === 'answered');
  const groundedAnswerCases = answeredCases.filter(
    (testCase) => testCase.selectedIds.length > 0,
  ).length;
  const abstentionCases = cases.filter((testCase) => testCase.expectedOutcome === 'abstained');

  return {
    summary: {
      suite: 'retrieval-scenarios-v1',
      totalCases: cases.length,
      passedCases,
      passRate: passedCases / cases.length,
      groundedRecommendationRate: groundedAnswerCases / answeredCases.length,
      correctAbstentionRate:
        abstentionCases.filter((testCase) => testCase.passed).length / abstentionCases.length,
    },
    cases,
  };
}
