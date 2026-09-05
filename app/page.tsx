const foundationChecks = [
  'Next.js 16, React 19, and strict TypeScript',
  'Bun package management and a reproducible lockfile',
  'Local Supabase, PostgreSQL, and Docker workflow',
  'Biome, Vitest, Playwright, and production build gates',
];

export default function HomePage() {
  return (
    <main className="shell">
      <p className="eyebrow">Hey Kivi · semantic memory</p>
      <h1>Golden Goose</h1>
      <p className="lede">
        A trustworthy memory layer that turns grounded history into useful next actions.
      </p>
      <section aria-labelledby="foundation-title" className="foundation-card">
        <div>
          <p className="status">Phase 0 foundation complete</p>
          <h2 id="foundation-title">Quality before product surface.</h2>
        </div>
        <ul>
          {foundationChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
