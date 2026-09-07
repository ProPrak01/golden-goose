/**
 * A private subject scope used only by the database-backed evaluation suite.
 * It is deliberately excluded from normal product queries so deterministic
 * test records cannot influence a person's Kivi workspace or answers.
 */
export const evaluationFixtureSubjectKey = 'evaluation-fixture-v1';
