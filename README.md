# Golden Goose

An end-to-end, trustworthy semantic-memory experience for Hey Kivi.

## Foundation

- Next.js 16, React 19, Bun, and strict TypeScript
- Local Supabase/PostgreSQL managed through Docker
- Zod validation at every system boundary
- Biome, Vitest, Playwright, production builds, and type-checking gates

## Development

```bash
bun install
bun run infra:start
bun run db:reset
bun run dev
```

Run the quality suite with `bun run check`.

See [docs/README.md](docs/README.md) for the product, architecture, evaluation, and reviewer-operation plan.
