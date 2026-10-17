import {
  Award,
  Bot,
  CircleDot,
  Download,
  FileCheck2,
  HelpCircle,
  Link2,
} from 'lucide-react';
import type { AssessmentData } from '../../types/assessment';
import { Badge, Panel, QuietButton } from '../Panel';

interface ReportsViewProps {
  data: AssessmentData;
  onExport: () => void;
}

export function ReportsView({ data, onExport }: ReportsViewProps) {
  const { candidate, finding } = data;

  const rubricWeights = [
    { label: 'Functional Correctness', weight: '30%', score: '100%' },
    { label: 'Problem Solving & Algorithms', weight: '20%', score: '90%' },
    { label: 'Debugging & Validation', weight: '20%', score: '95%' },
    { label: 'AI Collaboration & Efficiency', weight: '15%', score: '85%' },
    { label: 'Code Understanding & Adaptability', weight: '15%', score: '90%' },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pb-4">
      {/* Report Banner */}
      <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="success">Evaluated Report</Badge>
            <span className="font-mono text-[12px] text-muted">{candidate.submissionId}</span>
          </div>
          <h1 className="mt-1.5 text-[20px] sm:text-[22px] font-bold tracking-tight text-ink">
            PROOF Recruiter Skill Findings Report
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Candidate: <strong className="text-ink">{candidate.name}</strong> · Role:{' '}
            <strong className="text-ink">{candidate.role}</strong> · Completed in{' '}
            <strong className="text-ink">{candidate.duration}</strong>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <QuietButton icon={Download} onClick={onExport} primary>
            Export Report (Markdown)
          </QuietButton>
        </div>
      </div>

      {/* Rubric Breakdown Card */}
      <Panel title="Evaluation Rubric & Weightings" icon={Award} subtitle="Objective competency scoring">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {rubricWeights.map((rw) => (
            <div key={rw.label} className="rounded-[8px] border border-line bg-surface-2 p-3.5 shadow-sm">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                Weight: {rw.weight}
              </span>
              <p className="mt-1 text-[13px] sm:text-[14px] font-semibold text-ink">{rw.label}</p>
              <p className="mt-2 text-[18px] sm:text-[20px] font-bold text-success">{rw.score}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Main Finding Detail */}
      <Panel
        title={`Finding — ${finding.title}`}
        icon={FileCheck2}
        subtitle={`${finding.evidence.length} linked evidence sources`}
      >
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="success">
              <CircleDot size={10} />
              {finding.status}
            </Badge>
            <Badge tone="neutral">Confidence · {finding.confidence}</Badge>
            <Badge tone="neutral">Impact · {finding.impact}</Badge>
            <span className="ml-auto font-mono text-[12px] text-muted">
              <Link2 size={13} className="inline mr-1" />
              {finding.sourceLinks} verified timeline references
            </span>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
              Evaluator Observation
            </h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{finding.observation}</p>
          </div>

          {/* AI Contribution */}
          <div className="rounded-[8px] border border-violet/30 bg-violetSoft p-4">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-violet">
              <Bot size={15} />
              AI Contribution Analysis ({finding.aiContribution.label})
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-ink">
              {finding.aiContribution.text}
            </p>
          </div>

          {/* Uncertainty / Transparency Notes */}
          <div className="rounded-[8px] border border-amber-300/70 bg-[#FFFBEB] dark:bg-[#2B2312] p-4">
            <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#92400E] dark:text-[#FBBF24]">
              <HelpCircle size={15} />
              Uncertainty & Evidence Boundary ({finding.uncertainty.label})
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-[#92400E] dark:text-[#FDE68A]">
              {finding.uncertainty.text}
            </p>
          </div>

          {/* Supporting Evidence List */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#475569]">
              Supporting Evidence Chronology
            </h3>
            <div className="mt-2.5 space-y-2.5">
              {finding.evidence.map((ev) => (
                <div key={ev.id} className="rounded-[8px] border border-line bg-surface-2 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-ink">{ev.title}</span>
                    <span className="font-mono text-[12px] text-muted">{ev.meta}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{ev.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
