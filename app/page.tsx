export default function HomePage() {
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
      <section className="ask-card" aria-labelledby="ask-title">
        <div>
          <p className="status">Ask Hey Kivi</p>
          <h2 id="ask-title">Give me the next best academic action.</h2>
        </div>
        <div className="composer">
          <p>When transcript memory is connected, your grounded answer will appear here.</p>
          <button type="button">
            Ask Kivi <span>→</span>
          </button>
        </div>
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
