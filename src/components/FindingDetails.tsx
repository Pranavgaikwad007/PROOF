import { Bot, CircleDot, FileSearch, HelpCircle, Link2, Tag } from 'lucide-react';
import type { Finding, SupportingEvidenceItem } from '../types/assessment';
import { Badge } from './Panel';
import { SupportingEvidence } from './SupportingEvidence';

interface FindingDetailsProps {
  finding: Finding;
  selectedEvidenceId: string | null;
  onSelectEvidence: (item: SupportingEvidenceItem) => void;
}

const statusTone = {
  Demonstrated: 'success',
  Partial: 'amber',
  'Not observed': 'neutral',
} as const;

const confidenceTone = {
  High: 'success',
  Medium: 'amber',
  Low: 'neutral',
} as const;

export function FindingDetails({ finding, selectedEvidenceId, onSelectEvidence }: FindingDetailsProps) {
  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card 2xl:min-h-0">
      <header className="shrink-0 border-b border-line px-3 py-2.5">
        <div className="flex items-start gap-2">
          <FileSearch size={14} className="mt-0.5 shrink-0 text-muted" strokeWidth={2} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">
              Finding details
            </p>
            <h2 className="mt-0.5 text-[13px] font-semibold leading-tight text-ink">{finding.title}</h2>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={statusTone[finding.status]}>
            <CircleDot size={9} strokeWidth={3} aria-hidden="true" />
            {finding.status}
          </Badge>
          <Badge tone={confidenceTone[finding.confidence]}>Confidence · {finding.confidence}</Badge>
          <Badge tone={finding.impact === 'High' ? 'danger' : 'neutral'}>Impact · {finding.impact}</Badge>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted">
            <Link2 size={11} aria-hidden="true" />
            {finding.sourceLinks} sources
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-line px-3 py-3">
          <h3 className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">Observation</h3>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink">{finding.observation}</p>
        </section>

        <section className="border-b border-line px-3 py-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">
              Supporting evidence
            </h3>
            <span className="ml-auto text-[10px] text-muted">{finding.evidence.length} linked items</span>
          </div>
          <div className="mt-2.5">
            <SupportingEvidence
              items={finding.evidence}
              selectedId={selectedEvidenceId}
              onSelect={onSelectEvidence}
            />
          </div>
        </section>

        <section className="border-b border-line px-3 py-3">
          <h3 className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">
            <Bot size={11} aria-hidden="true" />
            AI contribution
          </h3>
          <div className="mt-1.5 rounded-[6px] border border-violet/20 bg-violetSoft p-2.5">
            <Badge tone="violet">{finding.aiContribution.label}</Badge>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink">{finding.aiContribution.text}</p>
          </div>
        </section>

        <section className="border-b border-line px-3 py-3">
          <h3 className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">
            <HelpCircle size={11} aria-hidden="true" />
            Uncertainty / Notes
          </h3>
          <div className="mt-1.5 rounded-[6px] border border-amber/25 bg-amberSoft p-2.5">
            <Badge tone="amber">{finding.uncertainty.label}</Badge>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink">{finding.uncertainty.text}</p>
          </div>
        </section>

        <section className="px-3 py-3">
          <h3 className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.09em] text-faint">
            <Tag size={11} aria-hidden="true" />
            Tags
          </h3>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {finding.tags.map((tag) => (
              <li key={tag}>
                <Badge tone="neutral" className="normal-case tracking-normal">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
