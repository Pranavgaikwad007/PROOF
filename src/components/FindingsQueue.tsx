import { CheckCircle2, ChevronRight, FileSearch } from 'lucide-react';
import type { Finding } from '../types/assessment';
import { Badge } from './Panel';

interface FindingsQueueProps {
  findings: Finding[];
  selectedFindingId: string;
  onSelectFinding: (id: string) => void;
}

export function FindingsQueue({
  findings,
  selectedFindingId,
  onSelectFinding,
}: FindingsQueueProps) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-card border border-line bg-surface shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3 bg-surface-2/60">
        <div className="flex items-center gap-2">
          <FileSearch size={16} className="text-accent" />
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink">
            Findings Queue
          </h2>
        </div>
        <span className="rounded-full bg-accentSoft px-2 py-0.5 text-[11px] font-bold text-accent">
          {findings.length}
        </span>
      </div>

      {/* Queue List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-2">
        {findings.map((f) => {
          const isSelected = f.id === selectedFindingId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFinding(f.id)}
              className={`group flex w-full flex-col rounded-[8px] border p-3 text-left transition-all ${
                isSelected
                  ? 'border-accent bg-accentSoft/30 shadow-sm ring-1 ring-accent'
                  : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2
                    size={14}
                    className={isSelected ? 'text-accent' : 'text-success'}
                  />
                  <h3
                    className={`truncate text-[13px] font-semibold ${
                      isSelected ? 'text-accent' : 'text-ink'
                    }`}
                  >
                    {f.title}
                  </h3>
                </div>
                <ChevronRight
                  size={14}
                  className={`shrink-0 transition-transform ${
                    isSelected
                      ? 'text-accent translate-x-0.5'
                      : 'text-muted group-hover:text-ink'
                  }`}
                />
              </div>

              <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
                {f.observation}
              </p>

              <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-line/60 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Badge tone={f.status === 'Demonstrated' ? 'success' : 'neutral'}>
                    {f.status}
                  </Badge>
                  <span className="text-muted">· {f.confidence}</span>
                </div>
                <span className="font-mono text-muted">
                  {f.evidence.length} evidence
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
