import { listActiveMemories } from '@/server/memory/list-memories';
import { AskKiviCard } from '@/components/ask-kivi-card';
import { MemoryControlButton } from '@/components/memory-control-button';

export const dynamic = 'force-dynamic';

function formatSourceDate(occurredAt: string | null | undefined) {
  if (!occurredAt) return 'date unavailable';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(occurredAt));
}

export default async function HomePage() {
  const memories = await listActiveMemories();

  return (
    <main className="shell">
      <header className="topbar">
        <p className="brand">
          kivi<span>.</span>
        </p>
        <p>Today</p>
        <button type="button">Memory</button>
      </header>
      <section className="hero">
        <p className="eyebrow">Hey Kivi · academic continuity</p>
        <h1>What deserves your attention today?</h1>
        <p className="lede">
          Kivi uses only explicit, supported history. Every suggestion will show the source it
          relied on.
        </p>
      </section>
      <AskKiviCard />
      <section className="memory-timeline" aria-labelledby="memory-title">
        <div className="section-heading">
          <div>
            <p className="status">Live memory</p>
            <h2 id="memory-title">What Kivi can currently use.</h2>
          </div>
          <p>{memories.length} active</p>
        </div>
        {memories.length === 0 ? (
          <p className="empty-state">
            No supported memories yet. Kivi will wait for explicit evidence.
          </p>
        ) : (
          <ul className="memory-list">
            {memories.map((memory) => {
              const evidence = memory.memory_evidence[0];
              const transcript = evidence?.transcripts;

              return (
                <li key={memory.id}>
                  <div>
                    <p className="memory-type">{memory.memory_type}</p>
                    <h3>{memory.canonical_statement}</h3>
                    <p className="memory-source">
                      Evidence: “{evidence?.excerpt ?? 'No excerpt available'}” ·{' '}
                      {transcript?.source_app ?? 'Unknown source'} ·{' '}
                      {formatSourceDate(transcript?.occurred_at)}
                    </p>
                    <MemoryControlButton action="soft_expire" memoryId={memory.id} />
                  </div>
                  <p className="confidence">{Math.round(memory.confidence * 100)}% supported</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="grid">
        <article>
          <p className="status">Memory principles</p>
          <h2>Useful, never presumptive.</h2>
          <ul>
            <li>Explicit commitments and outcomes</li>
            <li>Source-linked evidence</li>
            <li>Clarification or abstention when support is weak</li>
          </ul>
        </article>
        <article>
          <p className="status">Inspection</p>
          <h2>Every decision has a trail.</h2>
          <p>Transcript → evidence → memory → retrieval → response.</p>
          <button type="button" className="quiet">
            Open decision history
          </button>
        </article>
      </section>
    </main>
  );
}
