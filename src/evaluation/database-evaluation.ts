import { composeAssistantResponse, planAssistantResponse } from '@/domain/assistant';
import { selectGroundedMemories } from '@/domain/retrieval';
import { getDatabaseClient } from '@/server/database/client';
import { listRetrievalCandidates } from '@/server/memory/retrieval-repository';
import { evaluationFixtureSubjectKey } from '@/server/memory/scopes';

const subjectKey = evaluationFixtureSubjectKey;

type FixtureMemory = {
  statement: string;
  status: 'active' | 'soft_expired' | 'superseded';
  confidence: number;
  transcript: string;
};

const fixtures: FixtureMemory[] = [
  {
    statement: 'The astrophysics mechanics assessment is due Friday.',
    status: 'active',
    confidence: 0.95,
    transcript: 'My astrophysics mechanics assessment is due Friday.',
  },
  {
    statement: 'The planetary report is due Monday.',
    status: 'soft_expired',
    confidence: 0.95,
    transcript: 'The planetary report was due Monday.',
  },
  {
    statement: 'The vector homework is due Thursday.',
    status: 'superseded',
    confidence: 0.95,
    transcript: 'The vector homework used to be due Thursday.',
  },
  {
    statement: 'The vector homework is due Friday.',
    status: 'active',
    confidence: 0.95,
    transcript: 'The vector homework deadline changed to Friday.',
  },
  {
    statement: 'The uncertain laboratory deadline is Wednesday.',
    status: 'active',
    confidence: 0.6,
    transcript: 'I think the uncertain laboratory deadline might be Wednesday.',
  },
  {
    statement: 'The Signals quiz is due Friday.',
    status: 'active',
    confidence: 0.95,
    transcript: 'My Signals quiz is due Friday.',
  },
  {
    statement:
      'The user explicitly reported rushing Signals revision after starting the night before.',
    status: 'active',
    confidence: 0.9,
    transcript: 'Last Signals quiz, I rushed revision because I started the night before.',
  },
  {
    statement: 'The user explicitly prefers two focused study blocks before a Signals assessment.',
    status: 'active',
    confidence: 0.9,
    transcript: 'For Signals, I prefer two focused study blocks before an assessment.',
  },
];

async function clearFixtures() {
  const database = getDatabaseClient();
  const { data: existing, error: existingError } = await database
    .from('memories')
    .select('id')
    .eq('subject_key', subjectKey);
  if (existingError) throw existingError;

  const ids = existing.map(({ id }) => id);
  if (ids.length > 0) {
    const { error: feedbackError } = await database
      .from('user_feedback')
      .delete()
      .in('memory_id', ids);
    if (feedbackError) throw feedbackError;
    const { error: decisionError } = await database
      .from('memory_decisions')
      .delete()
      .in('memory_id', ids);
    if (decisionError) throw decisionError;
    const { error: memoryError } = await database.from('memories').delete().in('id', ids);
    if (memoryError) throw memoryError;
  }

  const { error: transcriptError } = await database
    .from('transcripts')
    .delete()
    .eq('source_app', 'Evaluation fixture');
  if (transcriptError) throw transcriptError;
}

async function insertFixtures() {
  const database = getDatabaseClient();
  const ids = new Map<string, string>();

  for (const fixture of fixtures) {
    const { data: transcript, error: transcriptError } = await database
      .from('transcripts')
      .insert({
        occurred_at: '2026-09-11T11:00:00.000Z',
        source_app: 'Evaluation fixture',
        raw_asr: fixture.transcript,
        formatted_text: fixture.transcript,
        context: { evaluation_fixture: subjectKey },
      })
      .select('id')
      .single();
    if (transcriptError) throw transcriptError;

    const { data: memory, error: memoryError } = await database
      .from('memories')
      .insert({
        memory_type: 'fact',
        status: fixture.status,
        subject_key: subjectKey,
        canonical_statement: fixture.statement,
        confidence: fixture.confidence,
      })
      .select('id')
      .single();
    if (memoryError) throw memoryError;
    ids.set(fixture.statement, memory.id);

    const { error: evidenceError } = await database.from('memory_evidence').insert({
      memory_id: memory.id,
      transcript_id: transcript.id,
      excerpt: fixture.transcript,
      rationale: 'Database evaluation fixture.',
    });
    if (evidenceError) throw evidenceError;
  }

  const previousId = ids.get('The vector homework is due Thursday.');
  const correctedId = ids.get('The vector homework is due Friday.');
  if (!previousId || !correctedId) throw new Error('Correction fixtures were not created.');
  const { error: linkError } = await database
    .from('memories')
    .update({ superseded_by: correctedId })
    .eq('id', previousId);
  if (linkError) throw linkError;
  return ids;
}

export async function runDatabaseEvaluation() {
  await clearFixtures();
  const ids = await insertFixtures();
  const cases = [
    {
      id: 'database-active-memory-retrieval',
      request: 'When is the astrophysics mechanics assessment due?',
      expectedOutcome: 'answered',
      expectedMemoryId: ids.get('The astrophysics mechanics assessment is due Friday.'),
    },
    {
      id: 'database-soft-expired-exclusion',
      request: 'When is the planetary report due?',
      expectedOutcome: 'abstained',
      expectedMemoryId: undefined,
    },
    {
      id: 'database-supersession-propagation',
      request: 'When is the vector homework due?',
      expectedOutcome: 'answered',
      expectedMemoryId: ids.get('The vector homework is due Friday.'),
    },
    {
      id: 'database-weak-evidence-exclusion',
      request: 'When is the uncertain laboratory deadline?',
      expectedOutcome: 'abstained',
      expectedMemoryId: undefined,
    },
    {
      id: 'database-multi-dictation-action',
      request: 'What should I do for Signals this week?',
      expectedOutcome: 'answered',
      expectedMemoryId: ids.get('The Signals quiz is due Friday.'),
      expectedSelectedCount: 3,
      expectedResponseText: '3 related explicit memories',
    },
  ];

  const results = await Promise.all(
    cases.map(async (testCase) => {
      const startedAt = performance.now();
      const retrieval = selectGroundedMemories(
        await listRetrievalCandidates(testCase.request, { includeEvaluationFixtures: true }),
      );
      const plan = planAssistantResponse(testCase.request, retrieval);
      const response = composeAssistantResponse(plan, retrieval);
      const selectedIds =
        retrieval.kind === 'selected' ? retrieval.candidates.map(({ id }) => id) : [];
      const passed =
        plan.outcome === testCase.expectedOutcome &&
        (testCase.expectedMemoryId === undefined || selectedIds.includes(testCase.expectedMemoryId)) &&
        (testCase.expectedSelectedCount === undefined ||
          selectedIds.length === testCase.expectedSelectedCount) &&
        (testCase.expectedResponseText === undefined ||
          response.includes(testCase.expectedResponseText));
      return {
        ...testCase,
        actualOutcome: plan.outcome,
        selectedIds,
        response,
        latencyMs: Math.round(performance.now() - startedAt),
        passed,
      };
    }),
  );
  const passedCases = results.filter((result) => result.passed).length;

  return {
    summary: {
      fixtureScope: subjectKey,
      totalCases: results.length,
      passedCases,
      passRate: passedCases / results.length,
      maxLatencyMs: Math.max(...results.map((result) => result.latencyMs)),
    },
    cases: results,
  };
}
