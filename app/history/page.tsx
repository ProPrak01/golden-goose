import Link from 'next/link';
import type { Route } from 'next';
import { listDecisionHistory } from '@/server/memory/list-decision-history';

export const dynamic = 'force-dynamic';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export default async function HistoryPage() {
  const decisions = await listDecisionHistory();

  return (
    <main className="shell history-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          kivi<span>.</span>
        </Link>
        <p>Decision history</p>
        <Link href={'/evaluation' as Route}>Evaluation</Link>
      </header>
      <section className="hero">
        <p className="eyebrow">Inspectable memory</p>
        <h1>Every retained detail has a reason.</h1>
        <p className="lede">
          Review the decision, source, provider, and current memory state without changing the
          original transcript.
        </p>
      </section>
      <section className="history-list" aria-labelledby="history-title">
        <div className="section-heading">
          <div>
            <p className="status">Audit trail</p>
            <h2 id="history-title">{decisions.length} recent decisions</h2>
          </div>
          <Link href="/">Back to Today</Link>
        </div>
        {decisions.length === 0 ? (
          <p className="empty-state">No decisions have been recorded yet.</p>
        ) : (
          <ol>
            {decisions.map((decision) => {
              const memory = decision.memories;
              const transcript = decision.transcripts;

              return (
                <li key={decision.id}>
                  <div className="history-meta">
                    <p className="status">{decision.kind}</p>
                    <p>{formatDate(decision.created_at)}</p>
                  </div>
                  <h3>{memory?.canonical_statement ?? 'No durable memory created'}</h3>
                  <p>{decision.reason}</p>
                  <dl>
                    <div>
                      <dt>Source</dt>
                      <dd>
                        {transcript?.source_app ?? 'Unknown source'} ·{' '}
                        {transcript ? formatDate(transcript.occurred_at) : 'date unavailable'}
                      </dd>
                    </div>
                    <div>
                      <dt>Evidence</dt>
                      <dd>“{transcript?.formatted_text ?? 'No transcript retained'}”</dd>
                    </div>
                    <div>
                      <dt>Memory status</dt>
                      <dd>{memory?.status ?? 'not created'}</dd>
                    </div>
                    <div>
                      <dt>Decision provider</dt>
                      <dd>
                        {decision.provider}
                        {decision.model ? ` · ${decision.model}` : ''}
                        {decision.latency_ms === null ? '' : ` · ${decision.latency_ms} ms`}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
