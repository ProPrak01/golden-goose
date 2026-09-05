import type { RetrievalResult } from '@/domain/retrieval';

export type AssistantPlan =
  | { outcome: 'answered'; reason: string }
  | { outcome: 'clarified'; reason: string }
  | { outcome: 'abstained'; reason: string };

export function planAssistantResponse(request: string, retrieval: RetrievalResult): AssistantPlan {
  if (request.trim().length < 8) {
    return {
      outcome: 'clarified',
      reason: 'The request needs more detail before Kivi can use history.',
    };
  }
  if (retrieval.kind === 'abstain') {
    return { outcome: 'abstained', reason: retrieval.rationale };
  }
  return { outcome: 'answered', reason: retrieval.rationale };
}

export function composeAssistantResponse(plan: AssistantPlan, retrieval: RetrievalResult) {
  if (plan.outcome === 'clarified') {
    return 'Please tell me which course, task, or decision you want help with.';
  }
  if (plan.outcome === 'abstained') {
    return 'I do not have enough explicit, supported history to make a recommendation yet.';
  }

  const primaryMemory = retrieval.candidates[0];
  if (!primaryMemory) {
    throw new Error('An answered plan requires a selected memory.');
  }
  return `Based on the explicit memory “${primaryMemory.statement}”, open the task, identify the smallest unfinished deliverable, and reserve a focused work block before the stated deadline.`;
}
