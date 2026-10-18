import { Bot, CircleDot, FileSearch, HelpCircle, Tag, X } from 'lucide-react';
import type { Finding, SupportingEvidenceItem } from '../types/assessment';
import { Badge, Panel } from './Panel';
import { SupportingEvidence } from './SupportingEvidence';

interface FindingDetailsProps {
  finding: Finding;
  selectedEvidenceId: string | null;
  onSelectEvidence: (item: SupportingEvidenceItem) => void;
  onClose?: () => void;
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

export function FindingDetails({
  finding,
  selectedEvidenceId,
  onSelectEvidence,
  onClose,
}: FindingDetailsProps) {
  return (
    <Panel
      title="Finding Details"
      icon={FileSearch}
      subtitle={finding.title}
      className="h-full min-h-[400px] xl:min-h-0"
      bodyClassName="overflow-y-auto"
      actions={
        <div className="flex items-center gap-2">
          <Badge tone={statusTone[finding.status]}>
            <CircleDot size={10} strokeWidth={3} aria-hidden="true" />
            {finding.status}
          </Badge>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-line text-muted hover:bg-surface-2 hover:text-ink"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      }
    >
      {/* 1. Clear Heading: Finding title 16px, then meta row 13px chips */}
      <div className="border-b border-line bg-surface-2/60 p-4">
        <h2 className="text-[16px] font-semibold leading-snug text-ink">
          {finding.title}
        </h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge tone={confidenceTone[finding.confidence]}>
            Confidence · {finding.confidence}
          </Badge>
          <Badge tone={finding.impact === 'High' ? 'danger' : 'neutral'}>
            Impact · {finding.impact}
          </Badge>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 p-4">
        {/* 2. Observation Description Paragraph at 15px / line-height 1.5 with 16px spacing */}
        <section className="rounded-[8px] border border-line bg-surface p-4">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
            Observation
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            {finding.observation}
          </p>
        </section>

        {/* 3. Supporting Evidence Section */}
        <section className="rounded-[8px] border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
              Supporting Evidence · {finding.evidence.length} items
            </h3>
          </div>
          <div className="mt-3">
            <SupportingEvidence
              items={finding.evidence}
              selectedId={selectedEvidenceId}
              onSelect={onSelectEvidence}
            />
          </div>
        </section>

        {/* 4. AI Contribution Section */}
        <section className="rounded-[8px] border border-violet/30 bg-violetSoft/50 p-4">
          <div className="flex items-center gap-2">
            <Bot size={15} className="text-violet" aria-hidden="true" />
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-violet">
              AI Contribution
            </h3>
          </div>
          <div className="mt-2.5">
            <Badge tone="violet">{finding.aiContribution.label}</Badge>
            <p className="mt-2 text-[14px] leading-relaxed text-ink">
              {finding.aiContribution.text}
            </p>
          </div>
        </section>

        {/* 5. Uncertainty / Notes Callout: readable 13-14px text on #FFFBEB with #92400E text per spec */}
        <section className="rounded-[8px] border border-amber-300/70 bg-[#FFFBEB] dark:bg-[#2B2312] p-4">
          <div className="flex items-center gap-2">
            <HelpCircle size={15} className="text-[#92400E] dark:text-[#FBBF24]" aria-hidden="true" />
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#92400E] dark:text-[#FBBF24]">
              Uncertainty / Notes
            </h3>
          </div>
          <div className="mt-2.5">
            <Badge tone="amber">{finding.uncertainty.label}</Badge>
            <p className="mt-2 text-[14px] leading-relaxed text-[#92400E] dark:text-[#FDE68A]">
              {finding.uncertainty.text}
            </p>
          </div>
        </section>

        {/* 6. Tags Section */}
        <section className="rounded-[8px] border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-muted" aria-hidden="true" />
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
              Tags
            </h3>
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-2">
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
    </Panel>
  );
}
