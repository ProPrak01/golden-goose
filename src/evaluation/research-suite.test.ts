import { describe, expect, it } from 'vitest';
import { runResearchSuite } from '@/evaluation/research-suite';

const report = runResearchSuite();

describe('research evaluation suite', () => {
  it('publishes the expected aggregate metrics', () => {
    expect(report.summary).toMatchObject({ totalCases: 126, passedCases: 126, passRate: 1 });
    expect(report.safetyBoundary.summary).toMatchObject({ totalCases: 120, passRate: 1 });
    expect(report.retrievalScenarios.summary).toMatchObject({ totalCases: 6, passRate: 1 });
    expect(report.retrievalScenarios.summary.groundedRecommendationRate).toBe(1);
    expect(report.retrievalScenarios.summary.correctAbstentionRate).toBe(1);
  });

  it.each(report.safetyBoundary.cases)('enforces $category boundary for $id', (testCase) => {
    expect(testCase.passed).toBe(true);
    expect(testCase.actualDecision).toBe(testCase.expectedDecision);
  });

  it.each(report.retrievalScenarios.cases)(
    'keeps the expected evidence path for $id',
    (testCase) => {
      expect(testCase.passed).toBe(true);
      expect(testCase.actualOutcome).toBe(testCase.expectedOutcome);
      expect(testCase.selectedIds).toEqual(testCase.expectedMemoryIds);
    },
  );
});
