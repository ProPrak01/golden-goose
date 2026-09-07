# Evaluation plan

## Evaluation principle

The evaluation must test the actual product claim, including the system's decision not to create or use memory. It must not be a collection of hand-selected successful demonstrations.

## Case categories

- Clear, well-supported fact creation
- Explicit preference creation and later use
- Episodic learning tied to a specific course, task, project, or deliverable
- Repeated supporting evidence
- Conflicting and superseding evidence
- Stale information and soft expiry
- Ambiguous reference requiring clarification
- Weak evidence requiring abstention
- Information intentionally ignored by policy
- Answers requiring evidence from multiple source transcripts
- User correction and deletion effects

## Per-case trace

Each result must retain:

- original input and metadata;
- expected behaviour;
- actual behaviour;
- memories created, retrieved, changed, rejected, ignored, or deleted;
- provenance links to source transcripts;
- retrieval candidates and ranking/selection reason;
- final response, tool action, clarification, or abstention;
- decision trace and model/provider metadata;
- latency, token/model usage, estimated cost, and storage impact where applicable.

## Reported metrics

- Grounded recommendation/answer rate
- Unsupported-answer rate
- Correct-abstention rate
- Memory-creation precision and policy-rejection rate
- Retrieval support coverage
- Correction and deletion propagation correctness
- Retrieval and end-to-end latency distributions
- Model usage and cost
- Database growth
- Failure categories with representative inspectable cases

## Current deterministic baseline

`bun run eval` runs the versioned baseline corpus and prints a machine-readable report. The current cases validate grounded fact retrieval, general planning with supported evidence, soft-expired and superseded memory exclusion, weak-evidence exclusion, unrelated-request abstention, ambiguous-request clarification, and inferred-trait rejection.

This deterministic safety baseline is complemented by the database-backed contract below, which runs the same retrieval policy against persisted local-Supabase fixtures and reports per-case database retrieval latency.

## Development corpus

`bun run corpus:import` recreates a versioned 500-record development corpus through the real ingestion
pipeline. It includes 390 explicit, supportable memories, 40 low-confidence details requiring
clarification, and 70 inferred-trait attempts that must be rejected. Each record preserves raw ASR,
formatted text, context metadata, the candidate, the resulting decision, and source provenance in local
Postgres. Corpus records use a dedicated scope and cannot affect normal product retrieval.

## Database-backed contract

`bun run eval:database` refreshes only the `evaluation-fixture-v1` local fixture scope, then executes retrieval through the real repository and local Postgres. It verifies active-memory retrieval, soft-expired exclusion, supersession propagation, and weak-evidence exclusion while reporting per-case latency. It never clears user-scoped memory.
