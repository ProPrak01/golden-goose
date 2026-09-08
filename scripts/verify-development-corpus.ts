import { createRequire } from 'node:module';
import { createDevelopmentCorpus } from '@/corpus/development-corpus';
import { getDatabaseClient } from '@/server/database/client';
import { developmentCorpusSourceApp, developmentCorpusSubjectKey } from '@/server/memory/scopes';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');

loadEnvConfig(process.cwd());

function expectedDecisionFromInput(input: unknown) {
  if (!input || typeof input !== 'object') return 'unknown';
  const candidate = input as { confidence?: unknown; isSensitiveInference?: unknown };
  if (candidate.isSensitiveInference === true) return 'reject';
  if (typeof candidate.confidence === 'number' && candidate.confidence < 0.7) return 'clarify';
  return 'accept';
}

async function main() {
  const database = getDatabaseClient();
  const corpus = createDevelopmentCorpus();
  const { count: transcriptCount, error: transcriptError } = await database
    .from('transcripts')
    .select('*', { count: 'exact', head: true })
    .eq('source_app', developmentCorpusSourceApp);
  if (transcriptError) throw transcriptError;

  const { count: memoryCount, error: memoryError } = await database
    .from('memories')
    .select('*', { count: 'exact', head: true })
    .eq('subject_key', developmentCorpusSubjectKey);
  if (memoryError) throw memoryError;

  const { data: decisions, error: decisionError } = await database
    .from('memory_decisions')
    .select('decision_input, transcripts!inner(source_app)')
    .eq('transcripts.source_app', developmentCorpusSourceApp);
  if (decisionError) throw decisionError;

  const expected = corpus.reduce(
    (counts, record) => {
      counts[record.expectedDecision] += 1;
      return counts;
    },
    { accept: 0, clarify: 0, reject: 0 },
  );
  const actual = decisions.reduce(
    (counts, decision) => {
      const expectedDecision = expectedDecisionFromInput(decision.decision_input);
      if (expectedDecision in counts) counts[expectedDecision as keyof typeof counts] += 1;
      return counts;
    },
    { accept: 0, clarify: 0, reject: 0 },
  );

  const passed =
    transcriptCount === corpus.length &&
    memoryCount === expected.accept &&
    decisions.length === corpus.length &&
    JSON.stringify(actual) === JSON.stringify(expected);
  const report = {
    corpus: developmentCorpusSubjectKey,
    passed,
    expectedRecords: corpus.length,
    stored: {
      transcripts: transcriptCount ?? 0,
      decisions: decisions.length,
      durableMemories: memoryCount ?? 0,
      totalTrackedRows: (transcriptCount ?? 0) + decisions.length + (memoryCount ?? 0),
    },
    expectedDecisions: expected,
    actualDecisions: actual,
  };
  console.info(JSON.stringify(report, null, 2));
  if (!passed) process.exitCode = 1;
}

await main();
