import { describe, expect, it } from 'vitest';
import { runResearchSuite } from '@/evaluation/research-suite';

describe('research evaluation suite', () => {
  it('keeps all versioned safety and retrieval scenarios passing', () => {
    const report = runResearchSuite();

    expect(report.summary).toMatchObject({ totalCases: 126, passedCases: 126, passRate: 1 });
    expect(report.safetyBoundary.summary).toMatchObject({ totalCases: 120, passRate: 1 });
    expect(report.retrievalScenarios.summary).toMatchObject({ totalCases: 6, passRate: 1 });
    expect(report.retrievalScenarios.summary.groundedRecommendationRate).toBe(1);
    expect(report.retrievalScenarios.summary.correctAbstentionRate).toBe(1);
  });
});
