'use client';

import { useState } from 'react';

type HeyKiviResponse = {
  outcome: 'answered' | 'clarified' | 'abstained';
  response: string;
  memories: Array<{ id: string; statement: string }>;
};

const starterRequest = 'What should I do today?';

export function AskKiviCard() {
  const [request, setRequest] = useState(starterRequest);
  const [result, setResult] = useState<HeyKiviResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function askKivi() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hey-kivi', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ request }),
      });
      if (!response.ok) throw new Error('Kivi could not process that request.');

      setResult((await response.json()) as HeyKiviResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Kivi could not process that request.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="ask-card" aria-labelledby="ask-title">
      <div>
        <p className="status">Ask Hey Kivi</p>
        <h2 id="ask-title">Give me the next best academic action.</h2>
        <p className="ask-note">
          Kivi will answer only from active memories with visible evidence.
        </p>
      </div>
      <div className="composer">
        <label htmlFor="kivi-request">Your question</label>
        <textarea
          id="kivi-request"
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          maxLength={500}
          rows={3}
        />
        <button type="button" onClick={askKivi} disabled={isLoading || request.trim().length === 0}>
          {isLoading ? 'Checking evidence…' : 'Ask Kivi →'}
        </button>
        <div className="assistant-result" aria-live="polite">
          {error ? <p className="assistant-error">{error}</p> : null}
          {result ? (
            <>
              <p className="result-outcome">{result.outcome}</p>
              <p>{result.response}</p>
              {result.memories.length > 0 ? (
                <div className="result-source">
                  <p>Explicit memories used:</p>
                  <ul>
                    {result.memories.map((memory) => (
                      <li key={memory.id}>{memory.statement}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
