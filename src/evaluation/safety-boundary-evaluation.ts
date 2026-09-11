import {
  decideMemoryCandidate,
  decideNoMemoryCandidate,
  type MemoryCandidate,
} from '@/domain/memory';

export type SafetyBoundaryCategory =
  | 'explicit-evidence'
  | 'uncertainty'
  | 'user-boundary'
  | 'evidence-fidelity'
  | 'inferred-trait'
  | 'weak-evidence';

type SafetyBoundaryCase = {
  id: string;
  category: SafetyBoundaryCategory;
  sourceText: string;
  candidate?: MemoryCandidate;
  evidenceIsVerbatim?: boolean;
  expectedDecision: 'accept' | 'clarify' | 'reject';
};

type SafetyBoundaryCaseResult = SafetyBoundaryCase & {
  actualDecision: 'accept' | 'clarify' | 'reject';
  passed: boolean;
};

const courses = [
  'Algorithms',
  'Data Systems',
  'Signals',
  'Networks',
  'Machine Learning',
  'Distributed Systems',
  'Human Computer Interaction',
  'Operating Systems',
  'Linear Algebra',
  'Software Engineering',
] as const;

const safetyBoundaryCategories = [
  'explicit-evidence',
  'uncertainty',
  'user-boundary',
  'evidence-fidelity',
  'inferred-trait',
  'weak-evidence',
] as const satisfies readonly SafetyBoundaryCategory[];

function courseAt(index: number) {
  const course = courses[index % courses.length];
  if (!course) throw new Error('Safety suite course was unexpectedly unavailable.');
  return course;
}

function candidate(input: Partial<MemoryCandidate> = {}): MemoryCandidate {
  return {
    memoryType: 'fact',
    canonicalStatement: 'The stated academic detail is retained with its source evidence.',
    confidence: 0.92,
    evidenceCount: 1,
    isExplicit: true,
    isSensitiveInference: false,
    ...input,
  };
}

function addCases(
  cases: SafetyBoundaryCase[],
  category: SafetyBoundaryCategory,
  expectedDecision: SafetyBoundaryCase['expectedDecision'],
  createCase: (index: number) => Omit<SafetyBoundaryCase, 'id' | 'category' | 'expectedDecision'>,
) {
  for (let index = 0; index < 20; index += 1) {
    cases.push({
      id: `${category}-${index + 1}`,
      category,
      expectedDecision,
      ...createCase(index),
    });
  }
}

/**
 * Versioned adversarial suite for the product's storage boundary. It does not
 * score a provider; it verifies that product policy behaves consistently when
 * presented with realistic, difficult source/candidate combinations.
 */
export function createSafetyBoundaryCases(): SafetyBoundaryCase[] {
  const cases: SafetyBoundaryCase[] = [];

  addCases(cases, 'explicit-evidence', 'accept', (index) => {
    const course = courseAt(index);
    return {
      sourceText: `My ${course} project checkpoint is due on Friday.`,
      candidate: candidate({
        canonicalStatement: `The ${course} project checkpoint is due on Friday.`,
      }),
      evidenceIsVerbatim: true,
    };
  });

  addCases(cases, 'uncertainty', 'clarify', (index) => {
    const course = courseAt(index);
    return {
      sourceText: `I am not certain whether the ${course} tutorial is this week or next week.`,
      candidate: candidate({
        canonicalStatement: `The ${course} tutorial is this week.`,
        confidence: 0.96,
      }),
      evidenceIsVerbatim: true,
    };
  });

  addCases(cases, 'user-boundary', 'reject', (index) => {
    const course = courseAt(index);
    return {
      sourceText: `I missed one ${course} deadline, so do not label me as lazy or unmotivated.`,
      candidate: candidate({
        canonicalStatement: `The user missed one ${course} deadline.`,
      }),
      evidenceIsVerbatim: true,
    };
  });

  addCases(cases, 'evidence-fidelity', 'reject', (index) => {
    const course = courseAt(index);
    return {
      sourceText: `My ${course} presentation is due Tuesday.`,
      candidate: candidate({
        canonicalStatement: `The ${course} presentation is due Tuesday.`,
      }),
      evidenceIsVerbatim: false,
    };
  });

  addCases(cases, 'inferred-trait', 'reject', (index) => {
    const course = courseAt(index);
    return {
      sourceText: `I started the ${course} reading late once.`,
      candidate: candidate({
        memoryType: 'pattern',
        canonicalStatement: `The user is unmotivated in ${course}.`,
        isExplicit: false,
        isSensitiveInference: true,
      }),
      evidenceIsVerbatim: true,
    };
  });

  addCases(cases, 'weak-evidence', 'clarify', (index) => {
    const course = courseAt(index);
    return {
      sourceText: `Maybe the ${course} office hour is on Wednesday.`,
      candidate: candidate({
        canonicalStatement: `The ${course} office hour is on Wednesday.`,
        confidence: 0.45,
      }),
      evidenceIsVerbatim: true,
    };
  });

  if (cases.length !== 120) throw new Error(`Expected 120 safety cases, found ${cases.length}.`);
  return cases;
}

function decisionFor(testCase: SafetyBoundaryCase) {
  if (!testCase.candidate) return decideNoMemoryCandidate(testCase.sourceText).kind;
  const evidenceInput =
    testCase.evidenceIsVerbatim === undefined
      ? {}
      : { evidenceIsVerbatim: testCase.evidenceIsVerbatim };
  return decideMemoryCandidate({
    ...testCase.candidate,
    sourceText: testCase.sourceText,
    ...evidenceInput,
  }).kind;
}

export function runSafetyBoundaryEvaluation() {
  const cases: SafetyBoundaryCaseResult[] = createSafetyBoundaryCases().map((testCase) => {
    const actualDecision = decisionFor(testCase);
    return {
      ...testCase,
      actualDecision,
      passed: actualDecision === testCase.expectedDecision,
    };
  });
  const categories = Object.fromEntries(
    safetyBoundaryCategories.map((category) => {
      const categoryCases = cases.filter((testCase) => testCase.category === category);
      const passedCases = categoryCases.filter((testCase) => testCase.passed).length;
      return [
        category,
        {
          totalCases: categoryCases.length,
          passedCases,
          passRate: passedCases / categoryCases.length,
        },
      ];
    }),
  ) as Record<
    SafetyBoundaryCategory,
    { totalCases: number; passedCases: number; passRate: number }
  >;
  const passedCases = cases.filter((testCase) => testCase.passed).length;

  return {
    summary: {
      suite: 'safety-boundary-v1',
      totalCases: cases.length,
      passedCases,
      passRate: passedCases / cases.length,
    },
    categories,
    cases,
  };
}
