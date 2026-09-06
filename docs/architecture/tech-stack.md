# Technical stack decision

## Confirmed foundation

| Concern | Choice |
| --- | --- |
| Web framework | Next.js 16 with the App Router and React 19 |
| Language | TypeScript with strict compiler settings |
| Runtime and package manager | Bun, with exact versions pinned in the lockfile |
| Styling | Tailwind CSS and a small custom component system |
| Database platform | Local Supabase backed by PostgreSQL |
| Database capabilities | PostgreSQL structured metadata filtering and pgvector cosine similarity for opt-in hybrid retrieval |
| Embeddings | Optional OpenAI `text-embedding-3-small`; deterministic lexical fallback when no key/provider is configured |
| Local infrastructure | Docker-compatible runtime and Supabase CLI |
| Database workflow | Versioned migrations, reproducible seeds, generated database types, and local Studio inspection |
| Runtime validation | Zod at data-import, API, and model-output boundaries |
| Unit and integration tests | Vitest |
| End-to-end tests | Playwright |
| Formatting and linting | Biome |
| Quality gates | Biome, `tsc --noEmit`, unit/integration tests, end-to-end tests, migration checks, and production build |

## Architecture principles

- Keep the primary review path local; do not require a hosted dashboard, external database, or undocumented credentials.
- Keep all data access on the server; never expose privileged database credentials in the browser.
- Keep domain policy separate from UI and provider integrations so memory decisions are testable without a model call.
- Treat every external/model input as untrusted until validated by Zod.
- Record provenance, model/version metadata, latency, usage, and decision reasons with each consequential run.
- Keep lexical retrieval as a deterministic fallback and use vector similarity only alongside active-status, confidence, and evidence gates.
- Use Supabase services only where they advance product reliability, inspection, retrieval, or reproducibility.

## Deliberately out of scope for the first version

- Multi-user authentication and social features
- Storage uploads unrelated to the transcript-import flow
- Realtime features without a direct user-value case
- Edge functions without a specific operational need
- Microservices, Kubernetes, or separately deployed frontend and backend services
