# Server boundary

All backend code belongs here, not in React components or route handlers.

## Planned modules

- `database/` — Supabase clients and repository implementations
- `ingestion/` — transcript import and validation services
- `memory/` — lifecycle, provenance, correction, expiry, and policy services
- `retrieval/` — metadata, full-text, and evaluated vector retrieval
- `orchestration/` — grounded Hey Kivi response, clarification, and abstention flows
- `providers/` — model-provider adapters isolated behind typed interfaces
