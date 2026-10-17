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
    <div className="relative pl-3.5">
      <span className="absolute bottom-4 left-[8px] top-4 w-[2px] bg-line" aria-hidden="true" />
      <ul className="space-y-3">
        {items.map((item) => {
          const meta = kindMeta[item.kind];
          const Icon = meta.icon;
          const selected = item.id === selectedId;
          return (
            <li key={item.id} className="relative">
              <span
                className={`absolute -left-3.5 top-[16px] z-10 h-[15px] w-[15px] rounded-full border-2 bg-surface ${
                  selected ? 'border-accent ring-2 ring-accent/30' : 'border-line-strong'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute inset-[2.5px] rounded-full ${
                    selected ? 'bg-accent' : meta.tone === 'danger' ? 'bg-danger' : meta.tone === 'accent' ? 'bg-accent' : 'bg-violet'
                  }`}
                />
              </span>
              <article
                className={`rounded-[8px] border bg-surface p-3.5 transition-all ${
                  selected
                    ? 'border-accent shadow-[0_0_0_3px_rgb(var(--c-accent-soft))]'
                    : 'border-line hover:border-line-strong hover:shadow-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={16} className="mt-0.5 shrink-0 text-muted" strokeWidth={2.2} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-[14px] font-semibold leading-snug text-ink">
                        {item.title}
                      </h4>
                      {selected ? (
                        <span className="flex shrink-0 items-center gap-1 rounded bg-accentSoft px-2 py-0.5 text-[12px] font-bold text-accent">
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                          Viewing
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 font-mono text-[12px] text-muted">{item.meta}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.detail}</p>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`mt-2.5 inline-flex min-h-[32px] items-center gap-1.5 rounded-[6px] border px-3 text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                        selected
                          ? 'border-accent bg-accent text-white shadow-sm'
                          : 'border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2'
                      }`}
                    >
                      {item.action === 'output' ? (
                        <Eye size={13} aria-hidden="true" />
                      ) : item.action === 'diff' ? (
                        <GitCompare size={13} aria-hidden="true" />
                      ) : (
                        <Eye size={13} aria-hidden="true" />
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
