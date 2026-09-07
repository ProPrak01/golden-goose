# Runbook

This is the local, reproducible review path for the Hey Kivi semantic-memory project.

## Prerequisites

- Bun `>=1.4.2`
- Docker Desktop running
- A free local port for the Next app (`3000`) and local Supabase services

## Install and configure

```bash
bun install
bun run infra:start
```

Create `.env.local` using values printed by `bun run infra:status`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace_with_local_publishable_key
SUPABASE_SERVICE_ROLE_KEY=replace_with_local_service_role_key
LLM_PROVIDER=deterministic
EMBEDDING_PROVIDER=deterministic
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not use it in browser code or commit `.env.local`.

## Initialize the database

```bash
bun run db:reset
bun run db:types
bun run seed
```

The seed creates one supported deadline memory and one rejected inferred-trait case. The latter exists to demonstrate that Kivi refuses to retain a sensitive inferred label.

## Development corpus

The versioned development corpus contains 500 transcript-like records with raw ASR, formatted text,
metadata, expected policy outcomes, and accepted / clarification / rejected cases. It is imported through
the same transcript-to-memory pipeline as the product:

```bash
bun run corpus:import
```

It refreshes only the `development-corpus-v1` scope. Those records remain inspectable in local Supabase
Studio but are deliberately excluded from a normal Kivi workspace, normal Hey Kivi retrieval, and the
normal-user audit timeline.

## Run the application

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Local Supabase Studio is available at the Studio URL printed by `bun run infra:status`.

## Reviewer demo flow

1. On **Today**, inspect source-linked active memories and ask “What should I do today?”
2. Open **Capture memory**, enter a source statement and explicit memory statement, then review before saving.
3. On a memory card, select **Correct memory**. Save a corrected statement and confirm the prior version becomes superseded.
4. Open **Decision history** to inspect transcript evidence, decision reasons, lifecycle events, and provider metadata.
5. Open **Evaluation** for the deterministic safety baseline.

## Quality and evaluation

```bash
bun run check
bun run test:e2e
bun run eval
bun run eval:database
```

`bun run eval` is a pure, versioned safety corpus. `bun run eval:database` refreshes only the `evaluation-fixture-v1` subject scope and verifies the actual local Postgres retrieval path; it does not clear user-scoped memory.

## Optional hybrid semantic retrieval

The default mode is deterministic lexical retrieval and needs no hosted AI credential. To enable OpenAI embeddings for newly captured or corrected memories, update `.env.local` before creating those memories:

```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key_here
```

With this setting, the app saves `text-embedding-3-small` vectors to local pgvector and combines cosine similarity with the existing active-status, confidence, and provenance gates. Existing unembedded memories remain available through lexical fallback.

## Reset

To return the local database to migrations plus deterministic fixtures:

```bash
bun run db:reset
bun run db:types
bun run seed
```

To stop local infrastructure:

```bash
bun run infra:stop
```
