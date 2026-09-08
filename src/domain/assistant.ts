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

  const memories = retrieval.candidates;
  const primaryMemory = memories[0];
  if (!primaryMemory) {
    throw new Error('An answered plan requires a selected memory.');
  }

  if (memories.length === 1) {
    return `Based on the explicit memory “${primaryMemory.statement}”, open the task, identify the smallest unfinished deliverable, and reserve a focused work block before the stated deadline.`;
  }

  const statements = memories.map((memory) => `“${memory.statement}”`).join('; ');
  const combinedText = memories.map((memory) => memory.statement.toLocaleLowerCase()).join(' ');
  const hasExplicitRushingLesson = /rushed|night before|last.minute/.test(combinedText);
  const hasExplicitFocusPreference = /focused study blocks?|focused work blocks?/.test(
    combinedText,
  );
  const action =
    hasExplicitRushingLesson && hasExplicitFocusPreference
      ? 'Start with the smallest unfinished piece now, then reserve the focused study blocks you explicitly said work for you before the deadline.'
      : 'Open the smallest unfinished deliverable now and use the relevant explicit commitments together when planning the next work block.';

  return `I found ${memories.length} related explicit memories: ${statements}. ${action}`;
}
