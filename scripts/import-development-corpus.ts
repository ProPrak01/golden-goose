import { createRequire } from 'node:module';
import { createDevelopmentCorpus } from '@/corpus/development-corpus';
import { getDatabaseClient } from '@/server/database/client';
import { processTranscript } from '@/server/ingestion/process-transcript';
import { developmentCorpusSourceApp, developmentCorpusSubjectKey } from '@/server/memory/scopes';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env') as typeof import('@next/env');

loadEnvConfig(process.cwd());

function batches<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push([...values.slice(index, index + size)]);
  }
  return result;
}

async function clearDevelopmentCorpus() {
  const database = getDatabaseClient();
  const { data: existing, error: existingError } = await database
    .from('memories')
    .select('id')
    .eq('subject_key', developmentCorpusSubjectKey);
  if (existingError) throw existingError;

  const memoryIds = existing.map(({ id }) => id);
  for (const ids of batches(memoryIds, 100)) {
    const { error: feedbackError } = await database
      .from('user_feedback')
      .delete()
      .in('memory_id', ids);
    if (feedbackError) throw feedbackError;
    const { error: decisionError } = await database
      .from('memory_decisions')
      .delete()
      .in('memory_id', ids);
    if (decisionError) throw decisionError;
    const { error: memoryError } = await database.from('memories').delete().in('id', ids);
    if (memoryError) throw memoryError;
  }

  const { error: transcriptError } = await database
    .from('transcripts')
    .delete()
    .eq('source_app', developmentCorpusSourceApp);
  if (transcriptError) throw transcriptError;
}

async function main() {
  const corpus = createDevelopmentCorpus();
  const startedAt = performance.now();
  await clearDevelopmentCorpus();

  const results = [];
  for (const item of corpus) {
    results.push(
      await processTranscript({
        transcript: item.transcript,
        candidate: item.candidate,
        excerpt: item.excerpt,
        subjectKey: item.subjectKey,
      }),
    );
  }

  const summary = results.reduce(
    (counts, result) => {
      counts[result.decision.kind] += 1;
      return counts;
    },
    { accept: 0, clarify: 0, reject: 0 },
  );

  console.info(
    JSON.stringify(
      {
        corpus: developmentCorpusSubjectKey,
        recordsProcessed: corpus.length,
        decisions: summary,
        durableMemories: results.filter((result) => result.memoryId !== null).length,
        elapsedMs: Math.round(performance.now() - startedAt),
        averageRecordLatencyMs: Number(
          ((performance.now() - startedAt) / corpus.length).toFixed(2),
        ),
      },
      null,
      2,
    ),
  );
}

await main();
