import { useEffect, useMemo, useRef, useState } from 'react';
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
    chip: 'bg-violetSoft text-violet border-violet/30',
    dot: 'bg-violet',
    iconClass: 'text-violet',
    label: 'AI prompt',
  },
  'ai-response': {
    icon: Bot,
    chip: 'bg-violetSoft text-violet border-violet/30',
    dot: 'bg-violet',
    iconClass: 'text-violet',
    label: 'AI response',
  },
  code: {
    icon: Code2,
    chip: 'bg-accentSoft text-accent border-accent/30',
    dot: 'bg-accent',
    iconClass: 'text-accent',
    label: 'Code',
  },
  'test-fail': {
    icon: XCircle,
    chip: 'bg-dangerSoft text-danger border-danger/30',
    dot: 'bg-danger',
    iconClass: 'text-danger',
    label: 'Test failed',
  },
  'test-pass': {
    icon: CheckCircle2,
    chip: 'bg-successSoft text-success border-success/30',
    dot: 'bg-success',
    iconClass: 'text-success',
    label: 'Test passed',
  },
  question: {
    icon: MessageSquare,
    chip: 'bg-violetSoft text-violet border-violet/30',
    dot: 'bg-violet',
    iconClass: 'text-violet',
    label: 'Question',
  },
  refactor: {
    icon: RefreshCw,
    chip: 'bg-amberSoft text-amber border-amber/30',
    dot: 'bg-amber',
    iconClass: 'text-amber',
    label: 'Refactor',
  },
  submission: {
    icon: Flag,
    chip: 'bg-surface-2 text-ink border-line-strong',
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
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const visible = useMemo(
    () => events.filter((e) => activeCategories.has(e.category)),
    [events, activeCategories],
  );

  const allSelected = activeCategories.size === filterOrder.length;

  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [filterOpen]);

  useEffect(() => {
    if (!highlightedEventId) return;
    const el = document.getElementById(`trail-evt-${highlightedEventId}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedEventId]);

  return (
    <Panel
      title="BuildTrail"
      icon={LayoutList}
      subtitle={`${events.length} timeline events`}
      className="h-full min-h-[400px] xl:min-h-0"
      actions={
        <div ref={filterRef} className="relative">
          <QuietButton
            icon={SlidersHorizontal}
            onClick={() => setFilterOpen((prev) => !prev)}
            ariaExpanded={filterOpen}
            title="Filter event categories"
            active={!allSelected}
            className="min-h-[32px] px-3 text-[13px]"
          >
            Filter
            {!allSelected ? (
              <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-white">
                {activeCategories.size}
              </span>
            ) : null}
            <ChevronDown size={14} />
          </QuietButton>

          {filterOpen ? (
            <div
              role="dialog"
              aria-label="Filter events"
              className="proof-fade-in absolute right-0 top-full z-40 mt-1 w-60 rounded-[8px] border border-line bg-surface p-2 shadow-pop"
            >
              <div className="flex items-center justify-between border-b border-line px-2 pb-2">
                <span className="text-[12px] font-semibold text-ink">Categories</span>
                <span className="font-mono text-[12px] text-muted">
                  {activeCategories.size}/{filterOrder.length}
                </span>
              </div>
              <ul className="mt-1 space-y-1 py-1">
                {filterOrder.map((cat) => {
                  const meta = categoryMeta[cat];
                  const checked = activeCategories.has(cat);
                  return (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => onToggleCategory(cat)}
                        className={`flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                          checked ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface-2/60'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            checked ? 'border-accent bg-accent text-white' : 'border-line'
                          }`}
                        >
                          {checked ? '✓' : ''}
                        </span>
                        <meta.icon size={13} className={meta.iconClass} />
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
                  className="w-full rounded-[6px] px-2 py-1.5 text-left text-[12px] font-medium text-muted hover:bg-surface-2 hover:text-ink"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-3.5">
        {visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
            <FileText size={22} className="text-faint" aria-hidden="true" />
            <p className="text-[14px] font-medium text-ink">No events match the filter</p>
            <p className="max-w-[240px] text-[13px] text-muted">
              Enable one or more categories above to restore timeline events.
            </p>
            <QuietButton onClick={onClearFilters} className="mt-2">
              Reset filters
            </QuietButton>
          </div>
        ) : (
          <ol className="relative">
            {/* 2px connecting vertical line */}
            <span className="absolute bottom-3 left-[11px] top-3 w-[2px] bg-line" aria-hidden="true" />
            {visible.map((event) => {
              const meta = categoryMeta[event.category];
              const Icon = meta.icon;
              const highlighted = event.id === highlightedEventId;
              return (
                <li key={event.id} id={`trail-evt-${event.id}`} className="relative pl-8">
                  {/* 11px timeline dot */}
                  <span
                    className={`absolute left-0 top-[14px] z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border bg-surface transition-all ${
                      highlighted
                        ? 'border-accent ring-4 ring-accent/20 shadow-sm'
                        : 'border-line'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon size={11} className={meta.iconClass} strokeWidth={2.4} />
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    title={`Event ID: ${event.id}${event.ref ? ` (${event.ref})` : ''}`}
                    className={`mb-3 block w-full rounded-card border p-3.5 text-left transition-all focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                      highlighted
                        ? 'border-l-[3px] border-l-accent border-y-accent/40 border-r-accent/40 bg-accentSoft/70 shadow-sm'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
                    }`}
                  >
                    {/* Time, event type chip, and revision indicator */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] font-medium tabular-nums text-muted">
                        {event.time}
                      </span>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-[5px] border px-2 py-0.5 text-[12px] font-semibold leading-normal ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                      {event.revision ? (
                        <span className="ml-auto font-mono text-[12px] font-bold text-accent">
                          {event.revision}
                        </span>
                      ) : null}
                    </div>

                    {/* Event title 14px semibold */}
                    <p className="mt-2 text-[14px] font-semibold leading-snug text-ink">
                      {event.title}
                    </p>

                    {/* One-line description 13px */}
                    <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-muted">
                      {event.detail}
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
