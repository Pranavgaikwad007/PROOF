import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  FileSearch,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { AssessmentData, NavItemId } from '../../types/assessment';
import { Badge, Panel, QuietButton } from '../Panel';
import { SummaryMetrics } from '../SummaryMetrics';

interface OverviewViewProps {
  data: AssessmentData;
  onNavigate: (tab: NavItemId) => void;
}

export function OverviewView({ data, onNavigate }: OverviewViewProps) {
  const { candidate, summary, finding, events } = data;

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pb-4">
      {/* Hero Welcome & Mission Brief */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              <ShieldCheck size={26} strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="accent">Mission Brief</Badge>
                <span className="font-mono text-[12px] text-muted">{candidate.submissionId}</span>
              </div>
              <h1 className="mt-1.5 text-[20px] sm:text-[22px] font-bold tracking-tight text-ink">
                {candidate.assessment}
              </h1>
              <p className="mt-1 text-[13px] text-muted">
                Role: <span className="font-semibold text-ink">{candidate.role}</span> · Candidate:{' '}
                <span className="font-semibold text-ink">{candidate.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuietButton
              icon={FileSearch}
              onClick={() => onNavigate('evidence-inspector')}
              primary
            >
              Open Evidence Inspector
            </QuietButton>
          </div>
        </div>

        {/* Task Specification */}
        <div className="mt-5 rounded-[8px] border border-line bg-surface-2 p-4">
          <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#475569]">
            <FileText size={15} className="text-accent" />
            Task Specification & Requirements
          </h2>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink">
            {candidate.problem}
          </p>
        </div>

        {/* Success Criteria & Evaluation Rubric */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <CheckCircle2 size={16} className="text-success" />
              Success Criteria
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[13px] text-muted">
              <li>• Pass all automated boundary unit tests</li>
              <li>• Handle empty inputs & edge cases</li>
              <li>• Explain rationale when debugging with AI Coach</li>
            </ul>
          </div>

          <div className="rounded-[8px] border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Bot size={16} className="text-violet" />
              AI Collaboration Policy
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Assistance up to <strong>Level 3 (Verify)</strong>; Level 4 code generation disabled to ensure authentic problem solving.
            </p>
          </div>

          <div className="rounded-[8px] border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Sparkles size={16} className="text-amber" />
              Recording & Transparency
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              All IDE buffer edits, test runs, and AI exchanges are captured as observable timeline
              evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <SummaryMetrics metrics={summary} />

      {/* Two Column Section: Competency Finding Preview & Quick Links */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Primary Competency Evaluation"
          icon={FileSearch}
          subtitle="Evaluated from telemetry"
          className="h-full"
          bodyClassName="flex flex-col justify-between p-4"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-ink">{finding.title}</h3>
              <Badge tone="success">{finding.status}</Badge>
              <Badge tone="neutral">Confidence · {finding.confidence}</Badge>
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{finding.observation}</p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[13px]">
            <span className="text-muted">{finding.evidence.length} linked evidence records</span>
            <button
              type="button"
              onClick={() => onNavigate('evidence-inspector')}
              className="flex items-center gap-1.5 font-semibold text-accent hover:underline"
            >
              Inspect evidence diffs <ArrowRight size={14} />
            </button>
          </div>
        </Panel>

        <Panel
          title="Quick Workspace Navigation"
          icon={Code2}
          subtitle="Explore assessment sections"
          className="h-full"
          bodyClassName="p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('buildtrail')}
              className="flex min-h-[56px] items-center gap-3 rounded-[8px] border border-line bg-surface-2 p-3 text-left transition-all hover:border-line-strong hover:bg-surface hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Clock size={18} className="text-muted" />
              <div>
                <p className="text-[14px] font-semibold text-ink">BuildTrail</p>
                <p className="text-[12px] text-muted">{events.length} timeline events</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('evidence-inspector')}
              className="flex min-h-[56px] items-center gap-3 rounded-[8px] border border-line bg-surface-2 p-3 text-left transition-all hover:border-line-strong hover:bg-surface hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FileSearch size={18} className="text-accent" />
              <div>
                <p className="text-[14px] font-semibold text-ink">Evidence Inspector</p>
                <p className="text-[12px] text-muted">Diffs & graph workspace</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="flex min-h-[56px] items-center gap-3 rounded-[8px] border border-line bg-surface-2 p-3 text-left transition-all hover:border-line-strong hover:bg-surface hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FileText size={18} className="text-success" />
              <div>
                <p className="text-[14px] font-semibold text-ink">Recruiter Report</p>
                <p className="text-[12px] text-muted">Skill scorecard & rubric</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('feedback')}
              className="flex min-h-[56px] items-center gap-3 rounded-[8px] border border-line bg-surface-2 p-3 text-left transition-all hover:border-line-strong hover:bg-surface hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Sparkles size={18} className="text-violet" />
              <div>
                <p className="text-[14px] font-semibold text-ink">Candidate Feedback</p>
                <p className="text-[12px] text-muted">Strengths & growth paths</p>
              </div>
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
