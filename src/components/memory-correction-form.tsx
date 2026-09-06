'use client';

import { useState } from 'react';

export function MemoryCorrectionForm({
  memoryId,
  previousStatement,
}: {
  memoryId: string;
  previousStatement: string;
}) {
  const [canonicalStatement, setCanonicalStatement] = useState(previousStatement);
  const [detail, setDetail] = useState('I am correcting this memory.');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submitCorrection() {
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/memories/${memoryId}/corrections`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ canonicalStatement, detail, occurredAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Kivi could not save this correction.');
      setMessage('Correction saved. The previous memory is superseded and will not be retrieved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kivi could not save this correction.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="capture-form" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="corrected-memory">Corrected statement</label>
      <textarea
        id="corrected-memory"
        value={canonicalStatement}
        onChange={(event) => setCanonicalStatement(event.target.value)}
        rows={3}
      />
      <label htmlFor="correction-reason">Why is this wrong or outdated?</label>
      <textarea
        id="correction-reason"
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
        rows={3}
      />
      <p className="capture-policy">
        Saving creates a new explicit correction source. The previous memory is preserved as
        superseded for inspection and excluded from retrieval.
      </p>
      <button
        type="button"
        onClick={submitCorrection}
        disabled={isSaving || !canonicalStatement.trim() || !detail.trim()}
      >
        {isSaving ? 'Saving correction…' : 'Save correction'}
      </button>
      {message ? (
        <p className="capture-message" aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  );
}
