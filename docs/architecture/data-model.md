# Semantic-memory data model

## Core entities

| Entity | Purpose |
| --- | --- |
| `transcripts` | Immutable raw ASR, formatted output, source, timestamp, and contextual metadata. |
| `memories` | Durable, user-facing facts, preferences, episodes, or patterns with lifecycle status. |
| `memory_evidence` | Provenance links from a memory to the exact source transcript span and extraction rationale. |
| `memory_decisions` | An inspectable create, update, reject, expire, correction, or delete decision. |
| `retrieval_runs` | Candidate evidence considered for a Hey Kivi request, ranks, selection reasons, and timing. |
| `hey_kivi_runs` | Request, grounded result, clarification/abstention state, model metadata, cost, and latency. |
| `user_feedback` | Corrections, deletions, soft expiry, and dismissed guidance recorded as explicit user control. |

## Memory lifecycle

```text
candidate -> active -> superseded | soft_expired | deleted
candidate -> rejected
```

`transcripts` are never rewritten. Corrections create an auditable decision and either update a memory or supersede it with a newer one.

## Required memory fields

- stable ID and subject scope;
- type: `fact`, `preference`, `episode`, or `pattern`;
- canonical statement and structured payload;
- lifecycle status;
- confidence/evidence strength;
- created, last-confirmed, expiry, and superseded timestamps;
- source evidence and decision provenance.

## Retrieval contract

Every Hey Kivi result must retain the original request, candidate transcripts/memories, selected evidence, rejection rationale, final grounded result, abstention/clarification condition, and performance/model metadata.
