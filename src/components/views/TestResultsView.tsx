import { useState } from 'react';
import { CheckCircle2, FlaskConical, Loader2, Play, Terminal, XCircle } from 'lucide-react';
import { runCandidateTests } from '../../lib/api';
import type { CodeRevision, RevisionId, TestRun } from '../../types/assessment';
import { Badge, Panel } from '../Panel';

interface TestResultsViewProps {
  submissionId: string;
  testRuns: TestRun[];
  revisions: CodeRevision[];
  selectedRevision: RevisionId;
  onNewTestRun: (run: TestRun) => void;
  showToast: (msg: string) => void;
}

export function TestResultsView({
  submissionId,
  testRuns,
  revisions,
  selectedRevision,
  onNewTestRun,
  showToast,
}: TestResultsViewProps) {
  const [isRunning, setIsRunning] = useState(false);

  const activeRev = revisions.find((r) => r.id === selectedRevision) || revisions[revisions.length - 1];

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const code = activeRev?.lines.map((l) => l.text).join('\n') || '';
      const result = await runCandidateTests(submissionId, selectedRevision, code);
      onNewTestRun(result);
      showToast(`Test execution finished: ${result.summary}`);
    } catch (err: any) {
      showToast(`Test run error: ${err.message || 'Execution failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden">
      <Panel
        title="Test Runner & Verification Suite"
        icon={FlaskConical}
        subtitle={`${testRuns.length} recorded runs · Active revision: ${selectedRevision}`}
        className="flex min-h-0 flex-1 flex-col"
        bodyClassName="flex flex-col min-h-0 flex-1"
        actions={
          <button
            type="button"
            onClick={handleRunTests}
            disabled={isRunning}
            className="inline-flex min-h-[32px] items-center gap-2 rounded-[6px] bg-accent px-3.5 text-[13px] font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent"
          >
            {isRunning ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
            Run Tests ({selectedRevision})
          </button>
        }
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {testRuns.map((run) => {
            const Icon = run.passed ? CheckCircle2 : XCircle;
            return (
              <article
                key={run.id}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
              >
                <header className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-4 py-2.5">
                  <Icon
                    size={16}
                    className={run.passed ? 'text-success' : 'text-danger'}
                    strokeWidth={2.4}
                  />
                  <span className="text-[14px] font-semibold text-ink">{run.label}</span>
                  <Badge tone={run.passed ? 'success' : 'danger'}>{run.summary}</Badge>
                  <div className="ml-auto flex items-center gap-2 font-mono text-[12px] text-muted">
                    <span>Revision <strong className="text-ink">{run.revision}</strong></span>
                    <span>·</span>
                    <span>{run.time}</span>
                  </div>
                </header>
                <div className="bg-code-bg p-4">
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-mono text-muted">
                    <Terminal size={14} />
                    <span>Console output</span>
                  </div>
                  <pre className="overflow-x-auto font-mono text-[13px] leading-[22px] text-ink">
                    {run.output}
                  </pre>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
