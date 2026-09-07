/**
 * A private subject scope used only by the database-backed evaluation suite.
 * It is deliberately excluded from normal product queries so deterministic
 * test records cannot influence a person's Kivi workspace or answers.
 */
export const evaluationFixtureSubjectKey = 'evaluation-fixture-v1';

/** A reproducible development corpus used to test the full ingestion pipeline. */
export const developmentCorpusSubjectKey = 'development-corpus-v1';
export const developmentCorpusSourceApp = 'Development corpus';
