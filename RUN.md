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

If you want Sarvam reports and persisted decisions to include an estimated USD cost, set both prices in `.env.local` using the provider price current at the time of the run:

```bash
SARVAM_INPUT_TOKEN_COST_USD_PER_MILLION=your_current_input_price
SARVAM_OUTPUT_TOKEN_COST_USD_PER_MILLION=your_current_output_price
```

Both values are deliberately unset by default; Kivi reports usage tokens but does not invent a provider price.

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
bun run corpus:verify
```

It refreshes only the `development-corpus-v1` scope. Those records remain inspectable in local Supabase
Studio but are deliberately excluded from a normal Kivi workspace, normal Hey Kivi retrieval, and the
normal-user audit timeline.

## Live Sarvam smoke check

With `SARVAM_API` and `LLM_PROVIDER=sarvam` configured in `.env.local`, run a
small isolated import. The scope is excluded from product reads.

```bash
bun run corpus:import:file -- fixtures/sarvam-smoke.jsonl sarvam-smoke-v1
```

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
bun run eval:corpus
bun run eval:sarvam -- path/to/corpus.jsonl
```

`bun run eval` is a pure, versioned safety corpus. `bun run eval:database` refreshes only the `evaluation-fixture-v1` subject scope and verifies the actual local Postgres retrieval path; it does not clear user-scoped memory.

`bun run eval:corpus` queries the isolated 500-record `development-corpus-v1` scope through the real retrieval and response logic. It reports outcomes, selected evidence, response text, and latency without exposing that corpus in normal Kivi use.

`bun run corpus:import` also prints an exact local Postgres storage snapshot before and after the clean 500-record import, plus the per-table row and byte delta. This measures table and index growth across Kivi's core data relations.

`bun run eval:sarvam` runs raw ASR and formatted text through Sarvam extraction and Kivi's decision policy without writing to the database. A corpus can include optional `expectedDecision` (`accept`, `clarify`, or `reject`) either at the top level or in `context`. The report includes exact-policy pass rate, acceptance precision/recall, verbatim-evidence validity, candidate count, latency, and token totals. Unlabelled private records remain usable and are reported without affecting scored metrics.

For an auditable long provider run, the same command persists every completed record in local Postgres and can resume without repeating stored calls:

```bash
bun run eval:sarvam -- path/to/corpus.jsonl --resume run-id
```

Each stored record includes original transcript data, parsed extraction, raw provider response, policy result, evidence check, latency, token use, and estimated cost when configured.

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
