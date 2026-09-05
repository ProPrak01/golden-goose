# Golden Goose assignment checklist

This is the implementation and review checklist derived from the supplied assignment brief.

## Product requirements

- [ ] Build one working end-to-end product, not a prototype, static demo, notebook, prompt collection, or architecture-only proposal.
- [ ] Start from one genuinely useful use case and keep the capability set narrow.
- [ ] Make the ordinary-use experience clear.
- [ ] Make clear how memory changes later behaviour.
- [ ] Define the boundary between regular dictation and Hey Kivi.
- [ ] Handle incomplete or incorrect understanding in a user-legible way.
- [ ] Keep the user in control without making them administer the system.
- [ ] Use a normal-user interface; do not require a developer console for the product to make sense.

## Semantic-memory system requirements

- [ ] Decide what Kivi learns and deliberately ignores.
- [ ] Implement a lifecycle for creating, representing, storing, changing, removing, and rejecting memories.
- [ ] Model the relation between facts, episodes, and preferences used by the product.
- [ ] Retrieve relevant understanding when a person uses Hey Kivi.
- [ ] Make memory influence a visible response, tool use, or other user-facing behaviour.
- [ ] Make it possible to inspect why memory did or did not affect a result.
- [ ] Use real state, persistence, retrieval, and model decisions rather than a prepared demonstration sequence.
- [ ] Implement only the Hey Kivi tools required by the chosen use case.

## Development corpus and evaluation requirements

- [ ] Create or obtain approximately 500 transcript-like development records.
- [ ] Include raw ASR output, LLM-formatted output, and required metadata in each record.
- [ ] Run the complete pipeline reproducibly over the corpus.
- [ ] Preserve the original input for every evaluated result.
- [ ] Preserve every created, retrieved, changed, rejected, or ignored memory.
- [ ] Preserve memory provenance and the decision reason.
- [ ] Preserve resulting Hey Kivi behaviour.
- [ ] Measure latency, database growth, model usage, and cost where relevant.
- [ ] Make success, abstention, ambiguity, and failure cases visible.

## Internal-corpus readiness requirements

- [ ] Import a new corpus through a documented procedure.
- [ ] Process the imported corpus into inspectable memory state.
- [ ] Operate Hey Kivi against what the imported corpus taught the system.
- [ ] Support reasonable history-grounded questions without inventing unsupported answers.
- [ ] Recover information distributed across multiple dictations where the product requires it.

## Repository and reviewer requirements

- [ ] Include applicant-authored positioning and vision documents.
- [ ] Include complete source code, interface, backend, schema, migrations, seed data, corpus, evaluation, and generated results.
- [ ] Include a README covering product, architecture, use cases, limitations, results, and AI use.
- [ ] Include a RUN.md with one declared primary review method.
- [ ] Include .env.example with precisely named model environment variables, if required.
- [ ] Document install, migrate, seed, start, primary interactions, evaluation, corpus import, inspection, and reset commands.
- [ ] Test the complete reviewer journey from the final commit.
