import type { Json } from '@/generated/database.types';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';

export type StoredProviderEvaluationRecord = {
  corpusRecordId: string;
  transcript: Json;
  expectedDecision: 'accept' | 'clarify' | 'reject' | null;
  actualDecision: 'accept' | 'clarify' | 'reject';
  candidateCount: number;
  evidenceValid: boolean;
  extraction: Json;
  rawProviderResponse: Json;
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number | null;
};

export async function createProviderEvaluationRun(input: {
  corpusName: string;
  corpusSha256: string;
  provider: string;
  model: string;
  recordCount: number;
}): Promise<string> {
  const { data, error } = await getDatabaseClient()
    .from('provider_evaluation_runs')
    .insert({
      corpus_name: input.corpusName,
      corpus_sha256: input.corpusSha256,
      provider: input.provider,
      model: input.model,
      status: 'running',
      record_count: input.recordCount,
    })
    .select('id')
    .single();
  if (error) throw new RepositoryError('create provider evaluation run', error.message);
  return data.id;
}

export async function getProviderEvaluationRun(runId: string) {
  const { data, error } = await getDatabaseClient()
    .from('provider_evaluation_runs')
    .select('id, corpus_sha256, status, record_count')
    .eq('id', runId)
    .single();
  if (error) throw new RepositoryError('read provider evaluation run', error.message);
  return data;
}

export async function listProviderEvaluationRecordIds(runId: string): Promise<Set<string>> {
  const { data, error } = await getDatabaseClient()
    .from('provider_evaluation_records')
    .select('corpus_record_id')
    .eq('run_id', runId);
  if (error) throw new RepositoryError('list provider evaluation records', error.message);
  return new Set(data.map((record) => record.corpus_record_id));
}

export async function listProviderEvaluationRecords(runId: string) {
  const { data, error } = await getDatabaseClient()
    .from('provider_evaluation_records')
    .select(
      'corpus_record_id, transcript, expected_decision, extraction, provider, model, latency_ms, input_tokens, output_tokens, estimated_cost_usd',
    )
    .eq('run_id', runId)
    .order('corpus_record_id');
  if (error) throw new RepositoryError('list provider evaluation records', error.message);
  return data;
}

export async function saveProviderEvaluationRecord(
  runId: string,
  record: StoredProviderEvaluationRecord,
): Promise<void> {
  const { error } = await getDatabaseClient().from('provider_evaluation_records').insert({
    run_id: runId,
    corpus_record_id: record.corpusRecordId,
    transcript: record.transcript,
    expected_decision: record.expectedDecision,
    actual_decision: record.actualDecision,
    candidate_count: record.candidateCount,
    evidence_valid: record.evidenceValid,
    extraction: record.extraction,
    raw_provider_response: record.rawProviderResponse,
    provider: record.provider,
    model: record.model,
    latency_ms: record.latencyMs,
    input_tokens: record.inputTokens,
    output_tokens: record.outputTokens,
    estimated_cost_usd: record.estimatedCostUsd,
  });
  if (error) throw new RepositoryError('save provider evaluation record', error.message);
}

export async function completeProviderEvaluationRun(runId: string, summary: Json): Promise<void> {
  const { error } = await getDatabaseClient()
    .from('provider_evaluation_runs')
    .update({ status: 'completed', completed_at: new Date().toISOString(), summary })
    .eq('id', runId);
  if (error) throw new RepositoryError('complete provider evaluation run', error.message);
}
