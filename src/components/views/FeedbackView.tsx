import {
  Award,
  CheckCircle2,
  Compass,
  MessageSquare,
  Sparkles,
  Target,
} from 'lucide-react';
import type { AssessmentData } from '../../types/assessment';
import { Badge, Panel } from '../Panel';

interface FeedbackViewProps {
  data: AssessmentData;
}

export function FeedbackView({ data }: FeedbackViewProps) {
  const { candidate, finding } = data;

  const strengths = [
    {
      title: 'Targeted Debugging Inquiry',
      description:
        'Instead of asking for full solutions, you asked precise questions targeting the loop termination invariant, allowing you to rapidly correct off-by-one errors.',
    },
    {
      title: 'Boundary Condition Resilience',
      description:
        'After identifying the failing upper-bound test case, you introduced a dual-biasing search helper that handles duplicates and edges gracefully.',
    },
    {
      title: 'Effective AI Collaboration',
      description:
        'You leveraged the AI Coach as a sounding board rather than a code generator, keeping your reasoning authentic and compliant with assessment policies.',
    },
  ];

  const practiceRecommendations = [
    {
      topic: 'Binary Search Edge Cases',
      action:
        'Practice problems involving shifted arrays and finding pivot elements to strengthen boundary pointer intuition.',
      difficulty: 'Medium',
    },
    {
      topic: 'State Preservation in Reactive UI',
      action:
        'Review patterns for preserving query and filter states during asynchronous updates in CRUD applications.',
      difficulty: 'Introductory',
    },
    {
      topic: 'Test-Driven Edge Exploration',
      action:
        'Write parameterized unit tests for empty strings, null inputs, and single-element collections prior to implementing core logic.',
      difficulty: 'Best Practice',
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pb-4">
      {/* Header Banner */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violetSoft text-violet">
            <MessageSquare size={22} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <Badge tone="violet">Candidate Feedback</Badge>
              <span className="font-mono text-[12px] font-medium text-muted">{candidate.submissionId}</span>
            </div>
            <h1 className="mt-1.5 text-[21px] font-bold tracking-tight text-ink">
              Personalized Performance Feedback & Growth Path
            </h1>
            <p className="mt-1 text-[13px] text-muted">
              Prepared for <strong className="font-semibold text-ink">{candidate.name}</strong> on completion of{' '}
              <strong className="font-semibold text-ink">{candidate.assessment}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Identified Strengths */}
        <Panel title="Identified Engineering Strengths" icon={Sparkles} subtitle="Validated from session telemetry">
          <div className="space-y-3.5 p-4">
            {strengths.map((s, idx) => (
              <div key={idx} className="rounded-card border border-line bg-surface-2 p-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0 text-success" />
                  <h3 className="text-[14px] font-semibold text-ink">{s.title}</h3>
                </div>
                <p className="mt-1.5 pl-6 text-[14px] leading-relaxed text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Practice Recommendations */}
        <Panel title="Recommended Practice & Next Steps" icon={Compass} subtitle="Curated skill enhancements">
          <div className="space-y-3.5 p-4">
            {practiceRecommendations.map((rec, idx) => (
              <div key={idx} className="rounded-card border border-line bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    <Target size={15} className="shrink-0 text-accent" />
                    {rec.topic}
                  </span>
                  <Badge tone="neutral">{rec.difficulty}</Badge>
                </div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{rec.action}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Evaluated Competency Summary */}
      <Panel title="Demonstrated Competency Snapshot" icon={Award} subtitle="Based on observation record">
        <div className="p-5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-ink">{finding.title}</h3>
            <Badge tone="success">{finding.status}</Badge>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">{finding.observation}</p>
        </div>
      </Panel>
    </div>
  );
}
