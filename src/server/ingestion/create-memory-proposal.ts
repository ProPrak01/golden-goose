import { decideMemoryCandidate, type MemoryCandidate } from '@/domain/memory';
import { memoryProposalInputSchema, type MemoryProposalInput } from '@/schemas/memory-proposal';

export type MemoryProposal = {
  input: MemoryProposalInput;
  candidate: MemoryCandidate;
  decision: ReturnType<typeof decideMemoryCandidate>;
};

export function createMemoryProposal(rawInput: unknown): MemoryProposal {
  const input = memoryProposalInputSchema.parse(rawInput);
  const candidate: MemoryCandidate = {
    memoryType: input.memoryType,
    canonicalStatement: input.memoryStatement,
    confidence: 0.9,
    evidenceCount: 1,
    isExplicit: input.isExplicit,
    isSensitiveInference: false,
  };

  return { input, candidate, decision: decideMemoryCandidate(candidate) };
}
