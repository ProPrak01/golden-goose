import { runRetrievalScenarioEvaluation } from '@/evaluation/retrieval-scenario-evaluation';
import { runSafetyBoundaryEvaluation } from '@/evaluation/safety-boundary-evaluation';

/** A single machine-readable report for the versioned policy/retrieval research suites. */
export function runResearchSuite() {
  const safetyBoundary = runSafetyBoundaryEvaluation();
  const retrievalScenarios = runRetrievalScenarioEvaluation();
  const totalCases = safetyBoundary.summary.totalCases + retrievalScenarios.summary.totalCases;
  const passedCases = safetyBoundary.summary.passedCases + retrievalScenarios.summary.passedCases;

  return {
    summary: {
      suite: 'kivi-research-suite-v1',
      totalCases,
      passedCases,
      passRate: passedCases / totalCases,
    },
    safetyBoundary,
    retrievalScenarios,
  };
}
