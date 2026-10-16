import { Bot, Check, Eye, FileText, GitCompare, Terminal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EvidenceKind, SupportingEvidenceItem } from '../types/assessment';

const kindMeta: Record<EvidenceKind, { icon: LucideIcon; label: string; tone: 'danger' | 'accent' | 'violet' }> = {
  test: { icon: Terminal, label: 'Test run', tone: 'danger' },
  revision: { icon: FileText, label: 'Code revision', tone: 'accent' },
  interaction: { icon: Bot, label: 'AI interaction', tone: 'violet' },
};

interface SupportingEvidenceProps {
  items: SupportingEvidenceItem[];
  selectedId: string | null;
  onSelect: (item: SupportingEvidenceItem) => void;
}

export function SupportingEvidence({ items, selectedId, onSelect }: SupportingEvidenceProps) {
  return (
    <div className="relative pl-3">
      <span className="absolute bottom-4 left-[7px] top-4 w-px bg-line" aria-hidden="true" />
      <ul className="space-y-2">
        {items.map((item) => {
          const meta = kindMeta[item.kind];
          const Icon = meta.icon;
          const selected = item.id === selectedId;
          return (
            <li key={item.id} className="relative">
              <span
                className={`absolute -left-3 top-[15px] z-10 h-[13px] w-[13px] rounded-full border-2 bg-surface ${
                  selected ? 'border-accent' : 'border-line-strong'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute inset-[2px] rounded-full ${
                    selected ? 'bg-accent' : meta.tone === 'danger' ? 'bg-danger/50' : meta.tone === 'accent' ? 'bg-accent/50' : 'bg-violet/50'
                  }`}
                />
              </span>
              <article
                className={`rounded-[6px] border bg-surface p-2.5 transition-shadow ${
                  selected
                    ? 'border-accent/40 shadow-[0_0_0_3px_rgb(var(--c-accent-soft))]'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <div className="flex items-start gap-2">
                  <Icon size={13} className="mt-px shrink-0 text-muted" strokeWidth={2.2} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate text-[11.5px] font-semibold leading-tight text-ink">
                        {item.title}
                      </h4>
                      {selected ? (
                        <span className="flex shrink-0 items-center gap-0.5 text-[9.5px] font-semibold text-accent">
                          <Check size={10} strokeWidth={3} aria-hidden="true" />
                          Open
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 font-mono text-[9.5px] text-faint">{item.meta}</p>
                    <p className="mt-1 text-[11px] leading-snug text-muted">{item.detail}</p>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`mt-1.5 inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-[3px] text-[10px] font-semibold transition-colors ${
                        selected
                          ? 'border-accent/30 bg-accentSoft text-accent'
                          : 'border-line bg-surface text-muted hover:border-line-strong hover:bg-surface-2 hover:text-ink'
                      }`}
                    >
                      {item.action === 'output' ? (
                        <Eye size={10} aria-hidden="true" />
                      ) : item.action === 'diff' ? (
                        <GitCompare size={10} aria-hidden="true" />
                      ) : (
                        <Eye size={10} aria-hidden="true" />
                      )}
                      {item.actionLabel}
                    </button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
