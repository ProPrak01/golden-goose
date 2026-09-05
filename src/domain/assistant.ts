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
