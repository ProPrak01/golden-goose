# Reviewer demo: Kivi in under ten minutes

This is the fastest way to validate the product claim without reading source
code first. Follow the local setup in [RUN.md](../../RUN.md), then open
`http://localhost:3000`.

## 1. Establish the boundary — 90 seconds

Open **Capture memory**. The source statement and proposed memory are visible
separately. Select **Incognito — do not retain this**, press **Keep private**,
and verify that Kivi says the text stayed in the form. No provider request or
database write occurs.

Turn Incognito off. Enter an explicit statement such as:

> My Signals quiz is due Friday.

With `SARVAM_API` configured, select **Ask Sarvam for explicit memories**.
Choose the suggested item, edit it if desired, then select **Review proposal**.
The suggestion is still not saved. Only **Save approved memory** writes a durable
record.

## 2. Show memory changing later behaviour — 2 minutes

On **Today**, ask:

> What should I do today for Signals?

Kivi should show its action and cite the memory it used, including the source
text and date. It must not turn an unrelated memory into a recommendation.

Ask an unrelated question such as “What is my home address?” and observe an
abstention rather than a fabricated answer.

## 3. Show control and provenance — 2 minutes

On an active memory, open **Correct memory** and save a revised statement. The
old memory becomes superseded; the correction is inspectable in **Decision
history**. Return to Today and soft-expire or delete a memory to verify it no
longer influences Hey Kivi.

## 4. Inspect deterministic safety and persisted retrieval — 2 minutes

```bash
bun run eval
bun run eval:database
bun run corpus:import
bun run corpus:verify
bun run eval:corpus
```

The database evaluation uses only `evaluation-fixture-v1`; the 500-record corpus
uses only `development-corpus-v1`. Neither pollutes the normal workspace.

## 5. Check the live provider boundary — optional, 2 minutes

```bash
bun run eval:sarvam -- fixtures/sarvam-smoke.jsonl
```

This runs three deliberately small labelled examples through Sarvam and reports
the extraction-policy result, evidence validity, tokens, and latency. For a
private evaluator corpus, use its JSONL path instead. The runner performs no
database writes.
