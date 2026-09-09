import { decideMemoryCandidate, type MemoryCandidate } from '@/domain/memory';
import type { MemoryExtraction } from '@/schemas/memory-extraction';
import type { MemoryExtractionRequest } from '@/schemas/memory-extraction-request';

export type ExtractedMemoryProposal = {
  input: MemoryExtractionRequest & {
    memoryStatement: string;
    memoryType: MemoryCandidate['memoryType'];
    isExplicit: true;
  };
  candidate: MemoryCandidate;
  excerpt: string;
  decision: ReturnType<typeof decideMemoryCandidate>;
};

/**
 * Converts provider output into reviewable product proposals. This deliberately
 * does not persist anything: the user must select and approve a proposal first.
 */
export function createExtractionProposals(
  input: MemoryExtractionRequest,
  extraction: MemoryExtraction,
): ExtractedMemoryProposal[] {
  return extraction.candidates.map((extracted) => {
    const candidate: MemoryCandidate = {
      memoryType: extracted.memoryType,
      canonicalStatement: extracted.canonicalStatement,
      confidence: extracted.confidence,
      evidenceCount: 1,
      isExplicit: extracted.isExplicit,
      isSensitiveInference: extracted.isSensitiveInference,
    };
    return {
      input: {
        ...input,
        memoryStatement: candidate.canonicalStatement,
        memoryType: candidate.memoryType,
        isExplicit: true,
      },
      candidate,
      excerpt: extracted.excerpt,
      decision: decideMemoryCandidate(candidate),
    };
  });
}
