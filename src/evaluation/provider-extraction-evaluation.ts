import { decideMemoryCandidate, type MemoryDecision } from '@/domain/memory';
import type { MemoryExtraction } from '@/schemas/memory-extraction';
import type { TranscriptInput } from '@/schemas/transcript';

export type ProviderRun = {
  extraction: MemoryExtraction;
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
};

export type ProviderEvaluationRecord = {
  id: string;
  transcript: TranscriptInput;
  /** Optional so private reviewer corpora can be imported without labels. */
  expectedDecision?: MemoryDecision['kind'];
};

type RecordResult = {
  id: string;
  expectedDecision?: MemoryDecision['kind'];
  actualDecision: MemoryDecision['kind'];
  evidenceValid: boolean;
  candidateCount: number;
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  passed: boolean | null;
};

function combineDecisions(decisions: MemoryDecision[]): MemoryDecision['kind'] {
  if (decisions.some((decision) => decision.kind === 'accept')) return 'accept';
  if (decisions.some((decision) => decision.kind === 'clarify')) return 'clarify';
  return 'reject';
}

function ratio(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

/**
 * Scores model extraction before any database write. It tests the exact policy
 * path used by ingestion and verifies that returned evidence is verbatim.
 */
export async function runProviderExtractionEvaluation(
  records: ProviderEvaluationRecord[],
  extract: (formattedText: string) => Promise<ProviderRun>,
) {
  const results: RecordResult[] = [];
  for (const record of records) {
    const run = await extract(record.transcript.formattedText);
    const decisions = run.extraction.candidates.map((candidate) =>
      decideMemoryCandidate({ ...candidate, evidenceCount: 1 }),
    );
    const actualDecision = combineDecisions(decisions);
    const evidenceValid = run.extraction.candidates.every((candidate) =>
      record.transcript.formattedText.includes(candidate.excerpt),
    );
    results.push({
      id: record.id,
      ...(record.expectedDecision === undefined
        ? {}
        : { expectedDecision: record.expectedDecision }),
      actualDecision,
      evidenceValid,
      candidateCount: run.extraction.candidates.length,
      provider: run.provider,
      model: run.model,
      latencyMs: run.latencyMs,
      inputTokens: run.inputTokens,
      outputTokens: run.outputTokens,
      passed:
        record.expectedDecision === undefined ? null : record.expectedDecision === actualDecision,
    });
  }

  const labeled = results.filter((result) => result.passed !== null);
  const accepted = results.filter((result) => result.actualDecision === 'accept');
  const expectedAccepted = labeled.filter((result) => result.expectedDecision === 'accept');
  const truePositives = expectedAccepted.filter(
    (result) => result.actualDecision === 'accept',
  ).length;
  const falsePositives = accepted.filter(
    (result) => result.expectedDecision !== undefined && result.expectedDecision !== 'accept',
  ).length;

  return {
    summary: {
      records: results.length,
      labeledRecords: labeled.length,
      passRate: ratio(labeled.filter((result) => result.passed).length, labeled.length),
      acceptancePrecision: ratio(truePositives, truePositives + falsePositives),
      acceptanceRecall: ratio(truePositives, expectedAccepted.length),
      invalidEvidenceCount: results.filter((result) => !result.evidenceValid).length,
      totalCandidates: results.reduce((total, result) => total + result.candidateCount, 0),
      totalLatencyMs: results.reduce((total, result) => total + result.latencyMs, 0),
      maxLatencyMs: Math.max(0, ...results.map((result) => result.latencyMs)),
      inputTokens: results.reduce((total, result) => total + (result.inputTokens ?? 0), 0),
      outputTokens: results.reduce((total, result) => total + (result.outputTokens ?? 0), 0),
    },
    results,
  };
}
