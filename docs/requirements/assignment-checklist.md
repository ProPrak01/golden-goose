# Golden Goose assignment checklist

This is the implementation and review checklist derived from the supplied assignment brief.

## Product requirements

- [x] Build one working end-to-end product, not a prototype, static demo, notebook, prompt collection, or architecture-only proposal.
- [x] Start from one genuinely useful use case and keep the capability set narrow.
- [x] Make the ordinary-use experience clear.
- [x] Make clear how memory changes later behaviour.
- [x] Define the boundary between regular dictation and Hey Kivi.
- [x] Handle incomplete or incorrect understanding in a user-legible way.
- [x] Keep the user in control without making them administer the system.
- [x] Use a normal-user interface; do not require a developer console for the product to make sense.

## Semantic-memory system requirements

- [x] Decide what Kivi learns and deliberately ignores.
- [x] Implement a lifecycle for creating, representing, storing, changing, removing, and rejecting memories.
- [x] Model the relation between facts, episodes, and preferences used by the product.
- [x] Retrieve relevant understanding when a person uses Hey Kivi.
- [x] Make memory influence a visible response, tool use, or other user-facing behaviour.
- [x] Make it possible to inspect why memory did or did not affect a result.
- [x] Use real state, persistence, retrieval, and model decisions rather than a prepared demonstration sequence.
- [x] Implement only the Hey Kivi tools required by the chosen use case.

## Development corpus and evaluation requirements

- [x] Create or obtain approximately 500 transcript-like development records.
- [x] Include raw ASR output, LLM-formatted output, and required metadata in each record.
- [x] Run the complete pipeline reproducibly over the corpus.
- [x] Preserve the original input for every evaluated result.
- [x] Preserve every created, retrieved, changed, rejected, or ignored memory.
- [x] Preserve memory provenance and the decision reason.
- [x] Preserve resulting Hey Kivi behaviour.
- [x] Measure latency, database growth, model usage, and cost where relevant (cost is explicitly null when no price snapshot is configured).
- [x] Make success, abstention, ambiguity, and failure cases visible.

## Internal-corpus readiness requirements

- [x] Import a new corpus through a documented procedure.
- [x] Process the imported corpus into inspectable memory state.
- [x] Operate Hey Kivi against what the imported corpus taught the system.
- [x] Support reasonable history-grounded questions without inventing unsupported answers.
- [x] Recover information distributed across multiple dictations where the product requires it.

## Repository and reviewer requirements

- [x] Include applicant-authored [positioning and vision](../part-one/positioning-and-vision.pdf) documents.
- [x] Include complete source code, interface, backend, schema, migrations, seed data, corpus, evaluation, and generated results.
- [x] Include a README covering product, architecture, use cases, limitations, results, and AI use.
- [x] Include a RUN.md with one declared primary review method.
- [x] Include .env.example with precisely named model environment variables, if required.
- [x] Document install, migrate, seed, start, primary interactions, evaluation, corpus import, inspection, and reset commands.
- [x] Test the complete reviewer journey from the final commit (formatting, lint, strict types, 31 unit tests, production build, and 6 Playwright flows).
