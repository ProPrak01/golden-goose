import { describe, expect, it } from 'vitest';
import { runEvaluation } from '@/evaluation/run-evaluation';

describe('evaluation corpus', () => {
  it('passes every documented safety and retrieval scenario', () => {
    const report = runEvaluation();

    expect(report.summary).toMatchObject({ totalCases: 8, passedCases: 8, passRate: 1 });
    expect(report.cases.every((result) => result.passed)).toBe(true);
  });
});
