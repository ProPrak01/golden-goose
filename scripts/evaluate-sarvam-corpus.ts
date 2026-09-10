import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { runProviderExtractionEvaluation } from '@/evaluation/provider-extraction-evaluation';
import type { Json } from '@/generated/database.types';
import { transcriptInputSchema } from '@/schemas/transcript';
import {
  completeProviderEvaluationRun,
  createProviderEvaluationRun,
  getProviderEvaluationRun,
  listProviderEvaluationRecordIds,
  saveProviderEvaluationRecord,
} from '@/server/evaluation/provider-evaluation-repository';
import { extractMemoriesWithSarvam } from '@/server/ingestion/sarvam-extractor';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd());

const inputPath = process.argv[2];
const resumeIndex = process.argv.indexOf('--resume');
const resumeRunId = resumeIndex === -1 ? undefined : process.argv[resumeIndex + 1];
if (!inputPath || (resumeIndex !== -1 && !resumeRunId)) {
  throw new Error('Usage: bun run eval:sarvam -- path/to/corpus.jsonl [--resume run-id]');
}

const recordSchema = z.object({
  id: z.string().trim().min(1).optional(),
  expectedDecision: z.enum(['accept', 'clarify', 'reject']).optional(),
  occurredAt: z.string(),
  sourceApp: z.string().optional(),
  rawAsr: z.string(),
  formattedText: z.string(),
  context: z.record(z.string(), z.unknown()).default({}),
});

const corpusText = await readFile(inputPath, 'utf8');
const lines = corpusText.split('\n').filter((line) => line.trim());
const records = lines.map((line, index) => {
  const raw = recordSchema.parse(JSON.parse(line));
  const contextExpectedDecision = raw.context['expectedDecision'];
  const expectedDecision =
    raw.expectedDecision ??
    (contextExpectedDecision === 'accept' ||
    contextExpectedDecision === 'clarify' ||
    contextExpectedDecision === 'reject'
      ? contextExpectedDecision
      : undefined);
  return {
    id: raw.id ?? `record-${index + 1}`,
    transcript: transcriptInputSchema.parse(raw),
    ...(expectedDecision === undefined ? {} : { expectedDecision }),
  };
});

const corpusSha256 = createHash('sha256').update(corpusText).digest('hex');
const runId =
  resumeRunId === undefined
    ? await createProviderEvaluationRun({
        corpusName: basename(inputPath),
        corpusSha256,
        provider: 'sarvam',
        model: 'sarvam-105b',
        recordCount: records.length,
      })
    : resumeRunId;

if (resumeRunId !== undefined) {
  const run = await getProviderEvaluationRun(runId);
  if (run.corpus_sha256 !== corpusSha256 || run.record_count !== records.length) {
    throw new Error('The requested run does not match this corpus file.');
  }
}

const completedIds = await listProviderEvaluationRecordIds(runId);
let processedThisInvocation = 0;
for (const record of records) {
  if (completedIds.has(record.id)) continue;
  const report = await runProviderExtractionEvaluation([record], extractMemoriesWithSarvam);
  const result = report.results[0];
  if (!result) throw new Error(`No evaluation result was returned for ${record.id}.`);
  await saveProviderEvaluationRecord(runId, {
    corpusRecordId: result.id,
    transcript: record.transcript as unknown as Json,
    expectedDecision: result.expectedDecision ?? null,
    actualDecision: result.actualDecision,
    candidateCount: result.candidateCount,
    evidenceValid: result.evidenceValid,
    extraction: result.extraction as unknown as Json,
    rawProviderResponse: result.rawProviderResponse,
    provider: result.provider,
    model: result.model,
    latencyMs: result.latencyMs,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    estimatedCostUsd: result.estimatedCostUsd,
  });
  processedThisInvocation += 1;
  console.info(
    `stored ${record.id} (${completedIds.size + processedThisInvocation}/${records.length})`,
  );
}

const persistedRecords = (await listProviderEvaluationRecordIds(runId)).size;
if (persistedRecords === records.length) {
  await completeProviderEvaluationRun(runId, {
    corpusSha256,
    records: records.length,
    persistedRecords,
    status: 'completed',
  });
}
console.info(
  JSON.stringify(
    { runId, corpusSha256, records: records.length, persistedRecords, processedThisInvocation },
    null,
    2,
  ),
);
