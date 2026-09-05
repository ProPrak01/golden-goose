# Product scope

## Current product direction

The planned product explores academic continuity: Hey Kivi uses explicitly grounded past commitments, outcomes, preferences, and lessons to help a person decide what deserves attention today.

The underlying system should remain adaptable to professional work histories, where courses and assignments become projects, meetings, deliverables, feedback, and decisions.

## Intended user journey

```text
Ordinary dictation or replayed transcript
  -> validated ingestion
  -> candidate memory extraction
  -> policy-based create, update, reject, or expire decision
  -> durable memory with source provenance
  -> user asks Hey Kivi for next-action guidance
  -> evidence-aware retrieval
  -> grounded recommendation, clarification, or abstention
  -> user can inspect, correct, delete, or soft-expire relevant memory
```

## Scope guardrails

- The first version will serve one focused Hey Kivi job rather than a general assistant.
- Recommendations must be grounded in source interactions and active memory state.
- Uncertain, stale, conflicting, or ambiguous evidence must cause qualification, clarification, or abstention rather than invention.
- The normal-user product flow must remain intelligible without the inspection tools.
- The inspection tools must expose the exact inputs, sources, memory changes, retrieval, and decision trace behind an outcome.

## Open product decisions

- [ ] The applicant independently finalizes the Part One positioning statement.
- [ ] The applicant independently finalizes the Part One vision document.
- [ ] Define the first Hey Kivi tool/action beyond grounded guidance, if one is needed.
- [ ] Define the normal-use surface through which transcripts and context enter the product.
- [ ] Define the exact user-facing language for confidence, source support, correction, deletion, and soft expiry.
