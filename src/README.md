# Source layout

`app/` owns Next.js route composition and the user-facing interface.

`src/` owns reusable application code:

- `client/` contains browser-only hooks and client state.
- `components/` contains reusable presentational components.
- `domain/` contains pure memory policy, retrieval, and decision logic.
- `schemas/` contains Zod contracts shared across boundaries.
- `server/` contains repositories, ingestion, memory, retrieval, orchestration, and provider adapters.
- `generated/` contains Supabase-generated database types.

Route handlers in `app/api/` must remain thin: validate input, call a `src/server` service, and return a typed response.
