# Delivery roadmap

## Phase 0: project foundation

- Scaffold the strict TypeScript Next.js application.
- Configure Bun, Biome, Vitest, Playwright, environment validation, and CI-quality scripts.
- Initialize local Supabase, PostgreSQL migrations, type generation, seed/reset commands, and Docker workflow.

## Phase 1: domain and data model

- Define validated transcript import format.
- Define memory, evidence, retrieval, decision, correction, and evaluation schemas.
- Implement migrations and test fixtures.
- Build deterministic domain logic for memory lifecycle and provenance.

## Phase 2: ingestion and memory lifecycle

- Import transcript records.
- Create candidate memories and apply policy decisions.
- Support update, rejection, soft expiry, correction, and deletion.
- Log every decision and source link.

## Phase 3: Hey Kivi product experience

- Build the normal-user product shell.
- Build the focused Hey Kivi request and response experience.
- Show supporting evidence and uncertainty in the user flow.
- Build user correction and memory-control interactions.

## Phase 4: retrieval, orchestration, and inspection

- Implement metadata, full-text, and evaluated semantic retrieval.
- Implement grounded response/action, clarification, and abstention paths.
- Build a reviewer/engineer inspection view for decision traces.

## Phase 5: corpus and evaluation

- Create the approximately 500-record corpus.
- Define expected behaviour before finalizing results.
- Implement the evaluation runner and generated reports.
- Measure quality, failure, abstention, latency, cost, and storage.

## Phase 6: review hardening

- Write README and RUN.md.
- Test a clean local install, migration, seed, import, run, evaluation, inspection, and reset path.
- Verify production build, types, lint, tests, and generated reports from the final commit.
