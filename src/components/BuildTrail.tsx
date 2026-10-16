import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  Code2,
  Eye,
  FileText,
  Flag,
  LayoutList,
  MessageSquare,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BuildEvent, EventCategory } from '../types/assessment';
import { Panel, QuietButton } from './Panel';

export const categoryMeta: Record<
  EventCategory,
  { icon: LucideIcon; chip: string; dot: string; iconClass: string; label: string }
> = {
  navigation: {
    icon: Eye,
    chip: 'bg-surface-2 text-muted border-line',
    dot: 'bg-muted',
    iconClass: 'text-muted',
    label: 'Navigation',
  },
  'ai-prompt': {
    icon: Sparkles,
    chip: 'bg-violetSoft text-violet border-violet/20',
    dot: 'bg-violet',
    iconClass: 'text-violet',
    label: 'AI prompt',
  },
  'ai-response': {
    icon: Bot,
    chip: 'bg-violetSoft text-violet border-violet/20',
    dot: 'bg-violet/70',
    iconClass: 'text-violet/80',
    label: 'AI response',
  },
  code: {
    icon: Code2,
    chip: 'bg-accentSoft text-accent border-accent/20',
    dot: 'bg-accent',
    iconClass: 'text-accent',
    label: 'Code',
  },
  'test-fail': {
    icon: XCircle,
    chip: 'bg-dangerSoft text-danger border-danger/20',
    dot: 'bg-danger',
    iconClass: 'text-danger',
    label: 'Test failed',
  },
  'test-pass': {
    icon: CheckCircle2,
    chip: 'bg-successSoft text-success border-success/20',
    dot: 'bg-success',
    iconClass: 'text-success',
    label: 'Test passed',
  },
  question: {
    icon: MessageSquare,
    chip: 'bg-violetSoft text-violet border-violet/20',
    dot: 'bg-violet/50',
    iconClass: 'text-violet/70',
    label: 'Question',
  },
  refactor: {
    icon: RefreshCw,
    chip: 'bg-amberSoft text-amber border-amber/20',
    dot: 'bg-amber',
    iconClass: 'text-amber',
    label: 'Refactor',
  },
  submission: {
    icon: Flag,
    chip: 'bg-ink/5 text-ink border-line',
    dot: 'bg-ink',
    iconClass: 'text-ink',
    label: 'Submission',
  },
};

const filterOrder: EventCategory[] = [
  'navigation',
  'ai-prompt',
  'ai-response',
  'question',
  'code',
  'refactor',
  'test-fail',
  'test-pass',
  'submission',
];

interface BuildTrailProps {
  events: BuildEvent[];
  activeCategories: Set<EventCategory>;
  onToggleCategory: (category: EventCategory) => void;
  onClearFilters: () => void;
  highlightedEventId: string | null;
  onSelectEvent: (event: BuildEvent) => void;
}

export function BuildTrail({
  events,
  activeCategories,
  onToggleCategory,
  onClearFilters,
  highlightedEventId,
  onSelectEvent,
}: BuildTrailProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterCount = filterOrder.length - activeCategories.size;
  const visible = events.filter((event) => activeCategories.has(event.category));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <Panel
      title="BuildTrail"
      icon={LayoutList}
      subtitle={`${visible.length} of ${events.length} events`}
      className="min-h-[420px] flex-1 2xl:min-h-0"
      bodyClassName="flex flex-col"
      actions={
        <div className="relative" ref={menuRef}>
          <QuietButton
            icon={SlidersHorizontal}
            active={open || filterCount > 0}
            ariaExpanded={open}
            onClick={() => setOpen((value) => !value)}
            title="Filter events by category"
          >
            {filterCount > 0 ? (
              <span className="rounded-[4px] bg-accent px-1 text-[9px] font-bold text-white">
                {filterCount}
              </span>
            ) : null}
            <ChevronDown size={11} aria-hidden="true" />
          </QuietButton>
          {open ? (
            <div
              role="menu"
              aria-label="Filter events"
              className="proof-fade-in absolute right-0 z-30 mt-1.5 w-56 rounded-card border border-line bg-surface p-1.5 shadow-pop"
            >
              <p className="px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-faint">
                Event categories
              </p>
              <ul className="max-h-64 overflow-y-auto">
                {filterOrder.map((category) => {
                  const meta = categoryMeta[category];
                  const checked = activeCategories.has(category);
                  const Icon = meta.icon;
                  return (
                    <li key={category}>
                      <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={checked}
                        onClick={() => onToggleCategory(category)}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left text-[11.5px] text-ink hover:bg-surface-2"
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
                            checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface'
                          }`}
                          aria-hidden="true"
                        >
                          {checked ? (
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5.2 4 7.5 8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                        <Icon size={13} className={`shrink-0 ${checked ? 'text-ink' : 'text-faint'}`} aria-hidden="true" />
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
                        <span className={checked ? 'font-medium' : 'text-muted'}>{meta.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-1 border-t border-line pt-1">
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="w-full rounded-[5px] px-2 py-1.5 text-left text-[11px] font-medium text-muted hover:bg-surface-2 hover:text-ink"
                >
                  Reset filters
                </button>
              </div>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <FileText size={18} className="text-faint" aria-hidden="true" />
            <p className="text-[12px] font-medium text-ink">No events match the filter</p>
            <p className="max-w-[200px] text-[11px] text-muted">
              Enable one or more categories to restore the timeline.
            </p>
            <QuietButton onClick={onClearFilters} className="mt-1">
              Reset filters
            </QuietButton>
          </div>
        ) : (
          <ol className="relative">
            <span className="absolute bottom-2 left-[9px] top-2 w-px bg-line" aria-hidden="true" />
            {visible.map((event) => {
              const meta = categoryMeta[event.category];
              const Icon = meta.icon;
              const highlighted = event.id === highlightedEventId;
              return (
                <li key={event.id} className="relative pl-7">
                  <span
                    className={`absolute left-0 top-[13px] z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full border bg-surface ${
                      highlighted ? 'border-accent ring-2 ring-accent/25' : 'border-line'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon size={9} className={meta.iconClass} strokeWidth={2.4} />
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className={`mb-2 block w-full rounded-[6px] border px-2.5 py-2 text-left transition-colors ${
                      highlighted
                        ? 'border-accent/40 bg-accentSoft/60'
                        : 'border-transparent hover:border-line hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-faint">
                        {event.time}
                      </span>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-[4px] border px-1 py-px text-[9px] font-semibold leading-[1.4] ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                      {event.revision ? (
                        <span className="ml-auto shrink-0 font-mono text-[9px] font-semibold text-faint">
                          {event.revision}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11.5px] font-semibold leading-snug text-ink">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted">{event.detail}</p>
                    <p className="mt-1.5 font-mono text-[9px] leading-none text-faint">
                      {event.ref}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Panel>
  );
}
