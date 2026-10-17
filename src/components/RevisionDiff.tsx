import { useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode2,
  GitCompare,
  Maximize2,
  Minimize2,
  Terminal,
  User,
  XCircle,
} from 'lucide-react';
import type {
  AiExchange,
  CodeRevision,
  DiffLine,
  DiffTab,
  RevisionId,
  TestRun,
} from '../types/assessment';
import { Badge, Panel, QuietButton } from './Panel';

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
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
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
  isFocusMode = false,
  onToggleFocusMode,
}: RevisionDiffProps) {
  const [annotationsOpen, setAnnotationsOpen] = useState(false);

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
      className="flex-1 min-h-[360px] xl:min-h-0 flex flex-col"
      bodyClassName="flex flex-col min-h-0 flex-1"
      actions={
        <div className="flex items-center gap-2">
          {/* Revision selector (R1/R2) — min-height 32px targets */}
          <div
            className="flex items-center gap-1 rounded-[6px] border border-line bg-surface-2 p-0.5"
            role="group"
            aria-label="Select revision"
          >
            {revisions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRevisionChange(item.id)}
                aria-pressed={item.id === selectedRevision}
                className={`min-h-[32px] rounded-[5px] px-3 text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  item.id === selectedRevision
                    ? 'bg-surface text-accent shadow-sm'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.id}
              </button>
            ))}
          </div>

          {onToggleFocusMode ? (
            <QuietButton
              icon={isFocusMode ? Minimize2 : Maximize2}
              onClick={onToggleFocusMode}
              title={isFocusMode ? 'Exit focus mode (Press M)' : 'Full-width code focus mode (Press M)'}
              className="min-h-[32px] px-3 text-[13px]"
            >
              <span className="hidden sm:inline">{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
            </QuietButton>
          ) : null}
        </div>
      }
    >
      {/* Tab bar — min-height 36px, 14px font, clear active state */}
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface-2/40 px-3">
        <div
          role="tablist"
          aria-label="Revision views"
          className="flex min-w-0 items-center gap-1 overflow-x-auto"
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
                className={`relative flex min-h-[36px] shrink-0 items-center gap-2 px-3.5 py-2 text-[14px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? 'font-semibold text-accent' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon size={15} strokeWidth={2} aria-hidden="true" />
                <span>{tab.label}</span>
                {active ? (
                  <span className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-accent" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Test summary chip (12px text, 28px min-height) */}
        <div className="hidden shrink-0 items-center gap-2.5 pl-3 sm:flex">
          <Badge tone={revision.testResult.passed === revision.testResult.total ? 'success' : 'danger'}>
            {revision.testResult.passed}/{revision.testResult.total} tests
          </Badge>
          <span className="font-mono text-[12px] text-muted">{revision.time}</span>
        </div>
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
            annotationsOpen={annotationsOpen}
            onToggleAnnotations={() => setAnnotationsOpen((prev) => !prev)}
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
    <div className="flex min-h-[36px] shrink-0 items-center gap-2.5 border-b border-line bg-surface-2 px-4 py-1.5">
      <FileCode2 size={14} className="text-muted" aria-hidden="true" />
      <span className="font-mono text-[13px] font-semibold text-ink">{filename}</span>
      <span className="truncate text-[12px] text-muted">· {note}</span>
    </div>
  );
}

function EvidenceView({
  revision,
  lines,
  focus,
  annotationsOpen,
  onToggleAnnotations,
}: {
  revision: CodeRevision;
  lines: DiffLine[];
  focus: boolean;
  annotationsOpen: boolean;
  onToggleAnnotations: () => void;
}) {
  const annotated = new Map(revision.annotations.map((item) => [item.line, item]));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CodeHeader
        filename={revision.filename}
        note={`${revision.language} · revision ${revision.id} · ${lines.length} lines`}
      />
      {/* Code viewer: 13-14px font, line-height 1.6, line numbers in 12px gutter */}
      <div className="min-h-0 flex-1 overflow-auto bg-code-bg">
        <div className="min-w-max py-1">
          {lines.map((line) => {
            const note = annotated.get(line.newNo ?? 0);
            return (
              <div key={`ev-${line.newNo ?? line.text}`} className="flex hover:bg-surface-2/60">
                <span className="sticky left-0 w-11 shrink-0 select-none border-r border-line bg-surface-2 px-2.5 text-right font-mono text-[12px] leading-[1.6] text-muted">
                  {line.newNo ?? ''}
                </span>
                <span
                  className={`flex-1 whitespace-pre px-4 font-mono text-[13px] sm:text-[14px] leading-[1.6] ${
                    note
                      ? note.tone === 'danger'
                        ? 'bg-dangerSoft/80 text-ink'
                        : note.tone === 'success'
                          ? 'bg-successSoft/80 text-ink'
                          : 'bg-accentSoft text-ink'
                      : 'text-ink'
                  } ${note ? 'border-l-[3px] border-l-accent' : ''}`}
                >
                  {line.text || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Annotations strip as an Accordion ("Annotations (3)") — collapsed by default per specification */}
      {revision.annotations.length > 0 ? (
        <div className="shrink-0 border-t border-line bg-surface">
          <button
            type="button"
            onClick={onToggleAnnotations}
            className="flex min-h-[36px] w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-surface-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">
                Annotations ({revision.annotations.length})
              </span>
              <span className="text-[12px] text-muted">
                {revision.annotations.length} observations on this revision
              </span>
            </div>
            <span className="text-muted">
              {annotationsOpen ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </span>
          </button>

          {annotationsOpen ? (
            <ul className="max-h-[160px] space-y-2 overflow-y-auto border-t border-line bg-surface-2/40 px-4 py-2.5">
              {revision.annotations.map((item) => (
                <li
                  key={`note-${item.line}`}
                  className={`flex gap-2.5 rounded-[6px] border p-2.5 transition-all ${
                    focus
                      ? item.tone === 'danger'
                        ? 'border-danger/30 bg-dangerSoft'
                        : 'border-success/30 bg-successSoft'
                      : 'border-line bg-surface'
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-[4px] px-1.5 py-0.5 font-mono text-[12px] font-bold ${
                      item.tone === 'danger' ? 'bg-danger text-white' : 'bg-success text-white'
                    }`}
                  >
                    L{item.line}
                  </span>
                  <p className="text-[14px] leading-relaxed text-ink">{item.text}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
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
  const hasDiff = previous !== null && (revision.additions > 0 || revision.deletions > 0);

  if (!hasDiff) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center bg-surface-2/30">
        <GitCompare size={32} className="text-muted mb-2.5" />
        <p className="text-[15px] font-semibold text-ink">Base Revision (No Prior Diff)</p>
        <p className="mt-1 text-[13px] text-muted max-w-sm">
          Revision {revision.id} is the initial code draft. Select a subsequent revision (such as R2) above to inspect unified diff lines.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CodeHeader
        filename={revision.filename}
        note={`${previous.id} → ${revision.id} · +${revision.additions} −${revision.deletions}`}
      />
      <div className="min-h-[320px] flex-1 overflow-auto bg-code-bg">
        <div className="min-w-max py-1">
          {revision.lines.map((line, index) => {
            const sign = line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' ';
            const rowTone =
              line.kind === 'add'
                ? 'bg-successSoft/70'
                : line.kind === 'del'
                  ? 'bg-dangerSoft/70'
                  : 'bg-transparent';
            const signTone =
              line.kind === 'add' ? 'text-success font-bold' : line.kind === 'del' ? 'text-danger font-bold' : 'text-faint';
            const gutterTone = line.kind === 'add' ? 'text-success font-semibold' : line.kind === 'del' ? 'text-danger font-semibold' : 'text-muted';
            return (
              <div key={`diff-${index}-${line.kind}`} className={`flex ${rowTone}`}>
                <span className="w-10 shrink-0 select-none border-r border-line bg-surface-2/60 px-2 text-right font-mono text-[12px] leading-[1.6] text-muted">
                  {line.oldNo ?? ''}
                </span>
                <span className={`w-10 shrink-0 select-none border-r border-line bg-surface-2/60 px-2 text-right font-mono text-[12px] leading-[1.6] ${gutterTone}`}>
                  {line.newNo ?? ''}
                </span>
                <span className={`w-5 shrink-0 select-none text-center font-mono text-[14px] leading-[1.6] ${signTone}`}>
                  {sign}
                </span>
                <span className="whitespace-pre px-3 font-mono text-[14px] leading-[1.6] text-ink">
                  {line.text || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex min-h-[36px] shrink-0 items-center gap-4 border-t border-line bg-surface px-4 py-2 text-[12px] text-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-success" aria-hidden="true" />
          {revision.additions} added
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-danger" aria-hidden="true" />
          {revision.deletions} removed
        </span>
        <span className="ml-auto text-muted">Unified line diff comparison</span>
      </div>
    </div>
  );
}

function TestOutput({ runs }: { runs: TestRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-center text-[14px] text-muted">
        No recorded test runs for this revision.
      </div>
    );
  }
  return (
    <div className="h-full min-h-0 space-y-3 overflow-y-auto p-4">
      {runs.map((run) => {
        const Icon = run.passed ? CheckCircle2 : XCircle;
        return (
          <article key={run.id} className="overflow-hidden rounded-[8px] border border-line shadow-card">
            <header className="flex min-h-[38px] items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2">
              <Icon
                size={15}
                className={run.passed ? 'text-success' : 'text-danger'}
                strokeWidth={2.4}
                aria-hidden="true"
              />
              <span className="text-[13px] font-semibold text-ink">{run.label}</span>
              <Badge tone={run.passed ? 'success' : 'danger'}>{run.summary}</Badge>
              <span className="ml-auto font-mono text-[12px] text-muted">
                {run.revision} · {run.time}
              </span>
            </header>
            <pre className="overflow-x-auto bg-code-bg p-4 font-mono text-[13px] leading-[1.6] text-ink">
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
    <div className="h-full min-h-0 overflow-y-auto p-4">
      <ol className="relative space-y-4">
        <span className="absolute bottom-3 left-[15px] top-3 w-[2px] bg-line" aria-hidden="true" />
        {exchanges.map((item) => {
          const candidate = item.role === 'candidate';
          return (
            <li key={item.id} className="relative pl-10">
              <span
                className={`absolute left-0 top-1.5 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border bg-surface shadow-sm ${
                  candidate ? 'border-line' : 'border-violet/30 bg-violetSoft'
                }`}
                aria-hidden="true"
              >
                {candidate ? (
                  <User size={15} className="text-muted" strokeWidth={2.2} />
                ) : (
                  <Bot size={15} className="text-violet" strokeWidth={2.2} />
                )}
              </span>
              <div className="rounded-[8px] border border-line bg-surface p-4 shadow-card">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-[13px] font-semibold text-ink">
                    {candidate ? 'Candidate Prompt' : 'AI Coach Response'}
                  </span>
                  <span className="font-mono text-[12px] text-muted">{item.time}</span>
                </div>
                <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                  {item.text}
                </p>
                <div className="mt-3 flex items-center gap-2 border-t border-line/60 pt-2 font-mono text-[12px] text-muted">
                  <span>Ref: <strong className="text-ink">{item.eventId}</strong></span>
                  {item.relatedRevision ? (
                    <span>· Revision: <strong className="text-ink">{item.relatedRevision}</strong></span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
