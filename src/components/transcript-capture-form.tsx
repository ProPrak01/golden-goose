'use client';

import { useState } from 'react';

type Proposal = {
  input: {
    occurredAt: string;
    sourceApp: string;
    transcriptText: string;
    memoryStatement: string;
    memoryType: 'fact' | 'preference' | 'episode' | 'pattern';
  };
  candidate: {
    confidence: number;
  };
  decision: {
    kind: 'accept' | 'clarify' | 'reject';
    reason: string;
  };
};

type ModelRun = {
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
};

type ExtractedProposal = Proposal & { excerpt: string };

type ExtractionResponse = {
  proposals: ExtractedProposal[];
  extractionReason: string;
  modelRun: ModelRun;
};

const defaultOccurredAt = '2026-09-11T09:00';

export function TranscriptCaptureForm() {
  const [transcriptText, setTranscriptText] = useState('Controls assignment is due Friday.');
  const [memoryStatement, setMemoryStatement] = useState('The Controls assignment is due Friday.');
  const [memoryType, setMemoryType] = useState<Proposal['input']['memoryType']>('fact');
  const [occurredAt, setOccurredAt] = useState(defaultOccurredAt);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [extractedProposals, setExtractedProposals] = useState<ExtractedProposal[]>([]);
  const [extractionModelRun, setExtractionModelRun] = useState<ModelRun | null>(null);
  const [selectedModelRun, setSelectedModelRun] = useState<ModelRun | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);

  const requestPayload = {
    occurredAt: new Date(occurredAt).toISOString(),
    sourceApp: 'Kivi',
    transcriptText,
    memoryStatement,
    memoryType,
    isExplicit: true as const,
  };

  async function reviewProposal() {
    if (isIncognito) {
      setProposal(null);
      setMessage('Incognito is on. This statement stays in this form and is not sent or saved.');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/memory-proposals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      if (!response.ok) throw new Error('Kivi could not review this memory proposal.');
      setProposal((await response.json()) as Proposal);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Kivi could not review this memory proposal.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function extractProposals() {
    if (isIncognito) {
      setProposal(null);
      setExtractedProposals([]);
      setMessage('Incognito is on. This statement stays in this form and is not sent or saved.');
      return;
    }
    setIsExtracting(true);
    setMessage(null);
    setProposal(null);
    try {
      const response = await fetch('/api/memory-extractions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          occurredAt: new Date(occurredAt).toISOString(),
          sourceApp: 'Kivi',
          transcriptText,
        }),
      });
      const body = (await response.json()) as ExtractionResponse | { error?: string };
      if (!response.ok || !('proposals' in body)) {
        throw new Error(
          'error' in body ? body.error : 'Kivi could not extract memory suggestions.',
        );
      }
      setExtractedProposals(body.proposals);
      setExtractionModelRun(body.modelRun);
      setSelectedModelRun(null);
      setMessage(
        body.proposals.length === 0
          ? 'Kivi found no explicit, durable academic memory in this statement. Nothing was saved.'
          : 'Choose a suggestion to place it in the review form. Nothing is saved yet.',
      );
    } catch (error) {
      setExtractedProposals([]);
      setExtractionModelRun(null);
      setMessage(
        error instanceof Error ? error.message : 'Kivi could not extract memory suggestions.',
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function selectExtractedProposal(extracted: ExtractedProposal, modelRun: ModelRun) {
    setMemoryStatement(extracted.input.memoryStatement);
    setMemoryType(extracted.input.memoryType);
    setSelectedModelRun(modelRun);
    setProposal(null);
    setMessage('Suggestion placed in the review form. Edit if needed, then review before saving.');
  }

  async function saveProposal() {
    if (!proposal) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          transcript: {
            occurredAt: proposal.input.occurredAt,
            sourceApp: proposal.input.sourceApp,
            rawAsr: proposal.input.transcriptText,
            formattedText: proposal.input.transcriptText,
            context: { origin: 'reviewed-capture' },
          },
          candidate: {
            memoryType: proposal.input.memoryType,
            canonicalStatement: proposal.input.memoryStatement,
            confidence: proposal.candidate.confidence,
            evidenceCount: 1,
            isExplicit: true,
            isSensitiveInference: false,
          },
          excerpt: proposal.input.transcriptText,
          ...(selectedModelRun === null ? {} : { modelRun: selectedModelRun }),
        }),
      });
      if (!response.ok) throw new Error('Kivi could not save this memory.');
      setMessage('Saved with linked evidence. You can inspect it on Today.');
      setProposal(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kivi could not save this memory.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="capture-form" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="capture-transcript">Source statement</label>
      <textarea
        id="capture-transcript"
        value={transcriptText}
        onChange={(event) => {
          setTranscriptText(event.target.value);
          setSelectedModelRun(null);
          setExtractedProposals([]);
          setExtractionModelRun(null);
        }}
        rows={4}
      />
      <button
        className="extract-button"
        type="button"
        onClick={extractProposals}
        disabled={isExtracting || !transcriptText.trim() || isIncognito}
      >
        {isExtracting ? 'Finding explicit memories…' : 'Ask Sarvam for explicit memories'}
      </button>
      <p className="capture-policy">
        Sarvam can suggest up to three candidates. It cannot save anything; you choose, review, and
        approve the final wording.
      </p>
      <label className="incognito-control" htmlFor="capture-incognito">
        <input
          id="capture-incognito"
          type="checkbox"
          checked={isIncognito}
          onChange={(event) => {
            setIsIncognito(event.target.checked);
            setProposal(null);
            setExtractedProposals([]);
            setExtractionModelRun(null);
            setSelectedModelRun(null);
            setMessage(null);
          }}
        />
        <span>
          <strong>Incognito — do not retain this</strong>
          <small>
            This statement stays on this device and is not sent, saved, or used by Hey Kivi.
          </small>
        </span>
      </label>
      <label htmlFor="capture-memory">What should Kivi remember?</label>
      <textarea
        id="capture-memory"
        value={memoryStatement}
        onChange={(event) => {
          setMemoryStatement(event.target.value);
          setSelectedModelRun(null);
        }}
        rows={3}
      />
      <div className="capture-fields">
        <label htmlFor="capture-type">Memory type</label>
        <select
          id="capture-type"
          value={memoryType}
          onChange={(event) => {
            setMemoryType(event.target.value as Proposal['input']['memoryType']);
            setSelectedModelRun(null);
          }}
        >
          <option value="fact">Fact</option>
          <option value="preference">Preference</option>
          <option value="episode">Episode</option>
          <option value="pattern">Pattern</option>
        </select>
        <label htmlFor="capture-time">When was this said?</label>
        <input
          id="capture-time"
          type="datetime-local"
          value={occurredAt}
          onChange={(event) => setOccurredAt(event.target.value)}
        />
      </div>
      <p className="capture-policy">
        You are confirming this is an explicit academic statement. Kivi will not infer emotion,
        motivation, or a personal trait from it.
      </p>
      <button
        type="button"
        onClick={reviewProposal}
        disabled={isLoading || !transcriptText.trim() || (!isIncognito && !memoryStatement.trim())}
      >
        {isLoading ? 'Reviewing…' : isIncognito ? 'Keep private' : 'Review proposal'}
      </button>
      {extractedProposals.length > 0 && extractionModelRun ? (
        <section className="extraction-results" aria-live="polite">
          <p className="status">Sarvam suggestions · not saved</p>
          {extractedProposals.map((extracted) => (
            <article key={`${extracted.input.memoryStatement}-${extracted.excerpt}`}>
              <p>{extracted.input.memoryStatement}</p>
              <small>Source: “{extracted.excerpt}”</small>
              <button
                type="button"
                onClick={() => selectExtractedProposal(extracted, extractionModelRun)}
              >
                Use this suggestion
              </button>
            </article>
          ))}
        </section>
      ) : null}
      {proposal ? (
        <section className="proposal-result" aria-live="polite">
          <p className="status">Proposal: {proposal.decision.kind}</p>
          <h2>{proposal.input.memoryStatement}</h2>
          <p>{proposal.decision.reason}</p>
          <p>Evidence Kivi will retain: “{proposal.input.transcriptText}”</p>
          <button
            type="button"
            onClick={saveProposal}
            disabled={isLoading || proposal.decision.kind !== 'accept'}
          >
            Save approved memory
          </button>
        </section>
      ) : null}
      {message ? (
        <p className="capture-message" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  );
}
