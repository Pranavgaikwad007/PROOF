import { useMemo } from 'react';
import { Bot, CheckCircle2, FileCode2, GitCompare, Terminal, User, XCircle } from 'lucide-react';
import type {
  AiExchange,
  CodeRevision,
  DiffLine,
  DiffTab,
  RevisionId,
  TestRun,
} from '../types/assessment';
import { Badge, Panel } from './Panel';

const tabs: { id: DiffTab; label: string; icon: typeof FileCode2 }[] = [
  { id: 'evidence', label: 'Evidence View', icon: FileCode2 },
  { id: 'diff', label: 'Diff View', icon: GitCompare },
  { id: 'tests', label: 'Test Output', icon: Terminal },
  { id: 'ai', label: 'AI Interaction Timeline', icon: Bot },
];

interface RevisionDiffProps {
  revisions: CodeRevision[];
  selectedRevision: RevisionId;
  onRevisionChange: (revision: RevisionId) => void;
  activeTab: DiffTab;
  onTabChange: (tab: DiffTab) => void;
  testRuns: TestRun[];
  aiExchanges: AiExchange[];
  focusAnnotation: boolean;
}

export function RevisionDiff({
  revisions,
  selectedRevision,
  onRevisionChange,
  activeTab,
  onTabChange,
  testRuns,
  aiExchanges,
  focusAnnotation,
}: RevisionDiffProps) {
  const revision = useMemo(
    () => revisions.find((item) => item.id === selectedRevision) ?? revisions[0],
    [revisions, selectedRevision],
  );
  const previous = revision.previous
    ? revisions.find((item) => item.id === revision.previous) ?? null
    : null;

  const currentLines = useMemo<DiffLine[]>(
    () => revision.lines.filter((line) => line.kind !== 'del'),
    [revision],
  );

  const runsForRevision = testRuns.filter((run) => run.revision === revision.id);

  return (
    <Panel
      title="Code Revision Inspector"
      icon={FileCode2}
      subtitle={revision.filename}
      className="flex-1"
      bodyClassName="flex flex-col"
      actions={
        <div
          className="flex items-center gap-0.5 rounded-[6px] border border-line bg-surface-2 p-0.5"
          role="group"
          aria-label="Select revision"
        >
          {revisions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRevisionChange(item.id)}
              aria-pressed={item.id === selectedRevision}
              className={`rounded-[4px] px-2 py-[3px] text-[10.5px] font-semibold transition-colors ${
                item.id === selectedRevision
                  ? 'bg-surface text-accent shadow-card'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {item.id}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-3 py-2">
        <div className="flex items-center gap-1.5 text-[10.5px]">
          <span className="text-muted">Previous</span>
          <span className="rounded-[4px] border border-line bg-surface-2 px-1.5 py-px font-mono font-semibold text-ink">
            {previous ? previous.id : '—'}
          </span>
        </div>
        <span className="text-faint" aria-hidden="true">
          →
        </span>
        <div className="flex items-center gap-1.5 text-[10.5px]">
          <span className="text-muted">Current</span>
          <span className="rounded-[4px] border border-accent/30 bg-accentSoft px-1.5 py-px font-mono font-semibold text-accent">
            {revision.id}
          </span>
        </div>
        <p className="min-w-0 truncate text-[10.5px] text-muted">{revision.summary}</p>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Badge tone={revision.testResult.passed === revision.testResult.total ? 'success' : 'danger'}>
            {revision.testResult.passed}/{revision.testResult.total} tests
          </Badge>
          <span className="font-mono text-[10px] text-faint">{revision.time}</span>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Revision views"
        className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-line px-2"
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          const index = tabs.findIndex((tab) => tab.id === activeTab);
          if (index === -1) return;
          event.preventDefault();
          const offset = event.key === 'ArrowRight' ? 1 : -1;
          const next = tabs[(index + offset + tabs.length) % tabs.length];
          onTabChange(next.id);
          document.getElementById(`tab-${next.id}`)?.focus();
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 px-2.5 py-2 text-[11px] font-medium transition-colors ${
                active ? 'text-accent' : 'text-muted hover:text-ink'
              }`}
            >
              <Icon size={12.5} strokeWidth={2} aria-hidden="true" />
              {tab.label}
              {active ? (
                <span className="absolute inset-x-1.5 -bottom-px h-[2px] rounded-full bg-accent" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {activeTab === 'evidence' ? (
          <EvidenceView
            revision={revision}
            lines={currentLines}
            focus={focusAnnotation}
          />
        ) : null}
        {activeTab === 'diff' ? <DiffView revision={revision} previous={previous} /> : null}
        {activeTab === 'tests' ? <TestOutput runs={runsForRevision} /> : null}
        {activeTab === 'ai' ? <AiTimeline exchanges={aiExchanges} /> : null}
      </div>
    </Panel>
  );
}

function CodeHeader({ filename, note }: { filename: string; note: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface-2 px-3 py-1.5">
      <FileCode2 size={12} className="text-muted" aria-hidden="true" />
      <span className="font-mono text-[10.5px] font-medium text-ink">{filename}</span>
      <span className="truncate text-[10px] text-muted">{note}</span>
    </div>
  );
}

function EvidenceView({
  revision,
  lines,
  focus,
}: {
  revision: CodeRevision;
  lines: DiffLine[];
  focus: boolean;
}) {
  const annotated = new Map(revision.annotations.map((item) => [item.line, item]));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CodeHeader
        filename={revision.filename}
        note={`${revision.language} · revision ${revision.id} · ${lines.length} lines`}
      />
      <div className="min-h-0 flex-1 overflow-auto bg-code-bg">
        <div className="min-w-max">
          {lines.map((line) => {
            const note = annotated.get(line.newNo ?? 0);
            return (
              <div key={`ev-${line.newNo ?? line.text}`} className="flex">
                <span className="sticky left-0 w-9 shrink-0 select-none border-r border-line bg-surface-2 px-2 text-right font-mono text-[10.5px] leading-[19px] text-faint">
                  {line.newNo ?? ''}
                </span>
                <span
                  className={`flex-1 whitespace-pre px-3 font-mono text-[11px] leading-[19px] ${
                    note
                      ? note.tone === 'danger'
                        ? 'bg-dangerSoft/70 text-ink'
                        : note.tone === 'success'
                          ? 'bg-successSoft/70 text-ink'
                          : 'bg-accentSoft text-ink'
                      : 'text-ink'
                  } ${note ? 'border-l-2 border-l-accent' : ''}`}
                >
                  {line.text || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-line bg-surface">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-faint">
            Annotations
          </span>
          <span className="text-[10px] text-muted">
            {revision.annotations.length} observations on this revision
          </span>
        </div>
        <ul className="max-h-[104px] space-y-1 overflow-y-auto px-3 pb-2">
          {revision.annotations.map((item) => (
            <li
              key={`note-${item.line}`}
              className={`flex gap-2 rounded-[5px] border px-2 py-1.5 ${
                focus
                  ? item.tone === 'danger'
                    ? 'border-danger/25 bg-dangerSoft'
                    : 'border-success/25 bg-successSoft'
                  : 'border-line bg-surface-2'
              }`}
            >
              <span
                className={`mt-px shrink-0 rounded-[3px] px-1 py-px font-mono text-[9px] font-bold ${
                  item.tone === 'danger' ? 'bg-danger text-white' : 'bg-success text-white'
                }`}
              >
                L{item.line}
              </span>
              <p className="text-[11px] leading-snug text-ink">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DiffView({
  revision,
  previous,
}: {
  revision: CodeRevision;
  previous: CodeRevision | null;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <CodeHeader
        filename={revision.filename}
        note={
          previous
            ? `${previous.id} → ${revision.id} · +${revision.additions} −${revision.deletions}`
            : `initial revision · +${revision.additions} −${revision.deletions}`
        }
      />
      <div className="min-h-0 flex-1 overflow-auto bg-code-bg">
        <div className="min-w-max">
          {revision.lines.map((line, index) => {
            const sign = line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' ';
            const rowTone =
              line.kind === 'add'
                ? 'bg-successSoft'
                : line.kind === 'del'
                  ? 'bg-dangerSoft'
                  : 'bg-transparent';
            const signTone =
              line.kind === 'add' ? 'text-success' : line.kind === 'del' ? 'text-danger' : 'text-faint';
            const gutterTone = line.kind === 'add' ? 'text-success' : line.kind === 'del' ? 'text-danger' : 'text-faint';
            return (
              <div key={`diff-${index}-${line.kind}`} className={`flex ${rowTone}`}>
                <span className="w-9 shrink-0 select-none border-r border-line bg-surface-2/60 px-2 text-right font-mono text-[10.5px] leading-[19px] text-faint">
                  {line.oldNo ?? ''}
                </span>
                <span className={`w-9 shrink-0 select-none border-r border-line bg-surface-2/60 px-2 text-right font-mono text-[10.5px] leading-[19px] ${gutterTone}`}>
                  {line.newNo ?? ''}
                </span>
                <span className={`w-4 shrink-0 select-none text-center font-mono text-[11px] leading-[19px] ${signTone}`}>
                  {sign}
                </span>
                <span className="whitespace-pre px-2 font-mono text-[11px] leading-[19px] text-ink">
                  {line.text || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 border-t border-line px-3 py-1.5 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-[2px] bg-success" aria-hidden="true" />
          {revision.additions} added
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-[2px] bg-danger" aria-hidden="true" />
          {revision.deletions} removed
        </span>
        <span className="ml-auto">Whitespace-only lines are preserved.</span>
      </div>
    </div>
  );
}

function TestOutput({ runs }: { runs: TestRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-[11.5px] text-muted">
        No recorded test runs for this revision.
      </div>
    );
  }
  return (
    <div className="h-full min-h-0 space-y-2 overflow-y-auto p-2.5">
      {runs.map((run) => {
        const Icon = run.passed ? CheckCircle2 : XCircle;
        return (
          <article key={run.id} className="overflow-hidden rounded-[6px] border border-line">
            <header className="flex items-center gap-2 border-b border-line bg-surface-2 px-2.5 py-1.5">
              <Icon
                size={12}
                className={run.passed ? 'text-success' : 'text-danger'}
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span className="text-[11px] font-semibold text-ink">{run.label}</span>
              <Badge tone={run.passed ? 'success' : 'danger'}>{run.summary}</Badge>
              <span className="ml-auto font-mono text-[10px] text-faint">
                {run.revision} · {run.time}
              </span>
            </header>
            <pre className="overflow-x-auto bg-code-bg px-3 py-2 font-mono text-[10.5px] leading-[17px] text-ink">
              {run.output}
            </pre>
          </article>
        );
      })}
    </div>
  );
}

function AiTimeline({ exchanges }: { exchanges: AiExchange[] }) {
  return (
    <div className="h-full min-h-0 overflow-y-auto p-2.5">
      <ol className="relative space-y-2">
        <span className="absolute bottom-3 left-[13px] top-3 w-px bg-line" aria-hidden="true" />
        {exchanges.map((item) => {
          const candidate = item.role === 'candidate';
          return (
            <li key={item.id} className="relative pl-8">
              <span
                className={`absolute left-0 top-1 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border bg-surface ${
                  candidate ? 'border-line' : 'border-violet/30 bg-violetSoft'
                }`}
                aria-hidden="true"
              >
                {candidate ? (
                  <User size={12} className="text-muted" strokeWidth={2.2} />
                ) : (
                  <Bot size={12} className="text-violet" strokeWidth={2.2} />
                )}
              </span>
              <div className="rounded-[6px] border border-line bg-surface p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-ink">
                    {candidate ? 'Candidate' : 'AI assistant'}
                  </span>
                  <Badge tone={candidate ? 'neutral' : 'violet'}>
                    {candidate ? 'Prompt' : 'Response'}
                  </Badge>
                  <span className="ml-auto font-mono text-[10px] text-faint">{item.time}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink">{item.text}</p>
                <p className="mt-1.5 font-mono text-[9.5px] text-faint">
                  {item.eventId}
                  {item.relatedRevision ? ` · linked to ${item.relatedRevision}` : ''}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
