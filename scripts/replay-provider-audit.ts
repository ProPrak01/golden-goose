import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { memoryExtractionSchema } from '@/schemas/memory-extraction';
import { transcriptInputSchema } from '@/schemas/transcript';
import { runHeyKivi } from '@/server/assistant/run-hey-kivi';
import { getDatabaseClient } from '@/server/database/client';
import { diffStorageSnapshots, getKiviStorageSnapshot } from '@/server/database/storage-metrics';
import { listProviderEvaluationRecords } from '@/server/evaluation/provider-evaluation-repository';
import { processTranscriptCandidates } from '@/server/ingestion/process-transcript';
import { providerAuditReplaySubjectKey } from '@/server/memory/scopes';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');
loadEnvConfig(process.cwd());

const providerRunId = process.argv[2];
if (!providerRunId) {
  throw new Error('Usage: bun run eval:provider-replay -- provider-evaluation-run-id');
}
const verifiedProviderRunId: string = providerRunId;

const replayContextKey = 'providerAuditReplay';
const replaySourceApp = 'Provider audit replay';

function batches<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push([...values.slice(index, index + size)]);
  }
  return result;
}

async function clearReplayScope() {
  const database = getDatabaseClient();
  const { data: transcripts, error: transcriptReadError } = await database
    .from('transcripts')
    .select('id')
    .contains('context', { [replayContextKey]: providerAuditReplaySubjectKey });
  if (transcriptReadError) throw transcriptReadError;

  const transcriptIds = transcripts.map((transcript) => transcript.id);
  const { data: memories, error: memoryReadError } = await database
    .from('memories')
    .select('id')
    .eq('subject_key', providerAuditReplaySubjectKey);
  if (memoryReadError) throw memoryReadError;

  const memoryIds = memories.map((memory) => memory.id);
  for (const ids of batches(memoryIds, 100)) {
    const { error: feedbackError } = await database
      .from('user_feedback')
      .delete()
      .in('memory_id', ids);
    if (feedbackError) throw feedbackError;
    const { error: memoryError } = await database.from('memories').delete().in('id', ids);
    if (memoryError) throw memoryError;
  }
  for (const ids of batches(transcriptIds, 100)) {
    const { error: decisionError } = await database
      .from('memory_decisions')
      .delete()
      .in('transcript_id', ids);
    if (decisionError) throw decisionError;
    const { error: transcriptDeleteError } = await database
      .from('transcripts')
      .delete()
      .in('id', ids);
    if (transcriptDeleteError) throw transcriptDeleteError;
  }
}

const queries = [
  { id: 'algorithms-deadline', request: 'When is the Algorithms problem set due?' },
  { id: 'signals-next-actions', request: 'What should I do for Signals this week?' },
  { id: 'unsupported-personal-detail', request: 'What is my home address?' },
  { id: 'ambiguous-request', request: 'Help' },
] as const;

async function main() {
  const sourceRecords = await listProviderEvaluationRecords(verifiedProviderRunId);
  if (sourceRecords.length === 0)
    throw new Error(`No stored records found for provider run ${verifiedProviderRunId}.`);

  await clearReplayScope();
  const storageBefore = await getKiviStorageSnapshot();
  const startedAt = performance.now();
  const decisions = { accept: 0, clarify: 0, reject: 0 };
  const records = [];

  for (const source of sourceRecords) {
    const sourceTranscript = transcriptInputSchema.parse(source.transcript);
    const transcript = transcriptInputSchema.parse({
      ...sourceTranscript,
      sourceApp: replaySourceApp,
      context: { ...sourceTranscript.context, [replayContextKey]: providerAuditReplaySubjectKey },
    });
    const extraction = memoryExtractionSchema.parse(source.extraction);
    const result = await processTranscriptCandidates({
      transcript,
      candidates: extraction.candidates.map((candidate) => ({
        candidate: { ...candidate, evidenceCount: 1 },
        excerpt: candidate.excerpt,
      })),
      subjectKey: providerAuditReplaySubjectKey,
      modelRun: {
        provider: source.provider,
        model: source.model,
        latencyMs: source.latency_ms,
        inputTokens: source.input_tokens,
        outputTokens: source.output_tokens,
        estimatedCostUsd:
          source.estimated_cost_usd === null ? null : Number(source.estimated_cost_usd),
      },
    });
    const actualDecision = result.results.some((item) => item.decision.kind === 'accept')
      ? 'accept'
      : result.results.some((item) => item.decision.kind === 'clarify')
        ? 'clarify'
        : (result.emptyDecision?.kind ?? 'reject');
    decisions[actualDecision] += 1;
    records.push({
      id: source.corpus_record_id,
      expectedDecision: source.expected_decision,
      actualDecision,
      transcriptId: result.transcriptId,
      memoryIds: result.results.flatMap((item) => (item.memoryId ? [item.memoryId] : [])),
      decisions: [...result.results.map((item) => item.decision), result.emptyDecision].filter(
        (decision) => decision !== undefined,
      ),
    });
  }

  const heyKivi = [];
  for (const query of queries) {
    const result = await runHeyKivi(query.request, { includeProviderAuditReplay: true });
    heyKivi.push({
      ...query,
      outcome: result.outcome,
      response: result.response,
      reason: result.reason,
      memoryIds: result.memories.map((memory) => memory.id),
      statements: result.memories.map((memory) => memory.statement),
    });
  }

  const storageAfter = await getKiviStorageSnapshot();
  const labeled = records.filter((record) => record.expectedDecision !== null);
  const exactMatches = labeled.filter(
    (record) => record.expectedDecision === record.actualDecision,
  ).length;
  const output = {
    reportVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceProviderRunId: verifiedProviderRunId,
    replayScope: providerAuditReplaySubjectKey,
    recordsProcessed: records.length,
    decisionSummary: decisions,
    exactPolicyMatches: exactMatches,
    exactPolicyMatchRate: labeled.length === 0 ? null : exactMatches / labeled.length,
    elapsedMs: Math.round(performance.now() - startedAt),
    storageBefore,
    storageAfter,
    storageDelta: diffStorageSnapshots(storageBefore, storageAfter),
    heyKivi,
    records,
  };
  await mkdir('output/evaluation', { recursive: true });
  const outputPath = join('output/evaluation', 'sarvam_500_end_to_end_report.json');
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.info(JSON.stringify({ outputPath, ...output, records: undefined }, null, 2));
}

await main();
