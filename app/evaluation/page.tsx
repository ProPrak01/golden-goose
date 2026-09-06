import Link from 'next/link';
import { runEvaluation } from '@/evaluation/run-evaluation';

export default function EvaluationPage() {
  const report = runEvaluation();
  const metrics = [
    ['Cases passed', `${report.summary.passedCases}/${report.summary.totalCases}`],
    ['Pass rate', `${Math.round(report.summary.passRate * 100)}%`],
    ['Correct abstention', `${Math.round(report.summary.correctAbstentionRate * 100)}%`],
    ['Policy rejection', `${Math.round(report.summary.policyRejectionRate * 100)}%`],
  ];

  return (
    <main className="shell history-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          kivi<span>.</span>
        </Link>
        <p>Evaluation</p>
        <Link href="/history">Decision history</Link>
      </header>
      <section className="hero">
        <p className="eyebrow">Safety evaluation</p>
        <h1>Evidence claims, tested as a contract.</h1>
        <p className="lede">
          This deterministic baseline tests behavior that should be true even when the best answer
          is clarification, abstention, or rejection.
        </p>
      </section>
      <section className="evaluation-summary" aria-label="Evaluation summary">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <section className="history-list" aria-labelledby="evaluation-results">
        <div className="section-heading">
          <div>
            <p className="status">Baseline corpus</p>
            <h2 id="evaluation-results">Inspectable case results</h2>
          </div>
          <Link href="/">Back to Today</Link>
        </div>
        <ol>
          {report.cases.map((result) => (
            <li key={result.id}>
              <div className="history-meta">
                <p className="status">{result.passed ? 'passed' : 'failed'}</p>
                <p>{result.id}</p>
              </div>
              <dl>
                <div>
                  <dt>Expected outcome</dt>
                  <dd>{result.expectedOutcome}</dd>
                </div>
                <div>
                  <dt>Actual outcome</dt>
                  <dd>{result.actualOutcome}</dd>
                </div>
                <div>
                  <dt>Expected selected memory</dt>
                  <dd>{result.expectedSelectedIds.join(', ') || 'none'}</dd>
                </div>
                <div>
                  <dt>Actual selected memory</dt>
                  <dd>{result.actualSelectedIds.join(', ') || 'none'}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
