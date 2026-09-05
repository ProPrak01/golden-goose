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
