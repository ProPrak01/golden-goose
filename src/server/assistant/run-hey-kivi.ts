import type { Json } from '@/generated/database.types';
import { composeAssistantResponse, planAssistantResponse } from '@/domain/assistant';
import { selectGroundedMemories } from '@/domain/retrieval';
import { getDatabaseClient } from '@/server/database/client';
import { RepositoryError } from '@/server/database/errors';
import { listRetrievalCandidates } from '@/server/memory/retrieval-repository';

export async function runHeyKivi(request: string) {
  const startedAt = performance.now();
  const candidates = await listRetrievalCandidates(request);
  const retrieval = selectGroundedMemories(candidates);
  const plan = planAssistantResponse(request, retrieval);
  const response = composeAssistantResponse(plan, retrieval);
  const database = getDatabaseClient();
  const selectedMemoryIds =
    retrieval.kind === 'selected' ? retrieval.candidates.map(({ id }) => id) : [];

  const { data: retrievalRun, error: retrievalError } = await database
    .from('retrieval_runs')
    .insert({
      query: request,
      candidates: candidates as unknown as Json,
      selected_memory_ids: selectedMemoryIds,
      rationale: retrieval.rationale,
      latency_ms: Math.round(performance.now() - startedAt),
    })
    .select('id')
    .single();
  if (retrievalError) throw new RepositoryError('record retrieval run', retrievalError.message);

  const { data: heyKiviRun, error: responseError } = await database
    .from('hey_kivi_runs')
    .insert({
      request,
      retrieval_run_id: retrievalRun.id,
      outcome: plan.outcome,
      response,
      reason: plan.reason,
      latency_ms: Math.round(performance.now() - startedAt),
    })
    .select('id')
    .single();
  if (responseError) throw new RepositoryError('record Hey Kivi run', responseError.message);

  return {
    id: heyKiviRun.id,
    outcome: plan.outcome,
    response,
    reason: plan.reason,
    memories: retrieval.kind === 'selected' ? retrieval.candidates : [],
  };
}
