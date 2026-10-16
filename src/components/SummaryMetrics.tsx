import { BarChart3, CheckCircle2, Clock3, Eye, Hourglass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SummaryMetric } from '../types/assessment';

const toneMap: Record<
  SummaryMetric['tone'],
  { text: string; icon: string; iconBg: string }
> = {
  neutral: {
    text: 'text-ink',
    icon: 'text-muted',
    iconBg: 'bg-surface-2 border-line',
  },
  success: {
    text: 'text-success',
    icon: 'text-success',
    iconBg: 'bg-successSoft border-success/20',
  },
  accent: {
    text: 'text-accent',
    icon: 'text-accent',
    iconBg: 'bg-accentSoft border-accent/20',
  },
  violet: {
    text: 'text-violet',
    icon: 'text-violet',
    iconBg: 'bg-violetSoft border-violet/20',
  },
  amber: {
    text: 'text-amber',
    icon: 'text-amber',
    iconBg: 'bg-amberSoft border-amber/20',
  },
};

const metricIcons: Record<string, LucideIcon> = {
  'm-1': CheckCircle2,
  'm-2': Clock3,
  'm-3': BarChart3,
  'm-4': Eye,
  'm-5': Hourglass,
};

export function SummaryMetrics({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <section
      aria-label="Assessment summary"
      className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5"
    >
      {metrics.map((metric) => {
        const tone = toneMap[metric.tone];
        const Icon = metricIcons[metric.id] ?? BarChart3;
        return (
          <article
            key={metric.id}
            className="flex min-w-0 items-start gap-2.5 rounded-card border border-line bg-surface px-3 py-2.5 shadow-card"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border ${tone.iconBg}`}
              aria-hidden="true"
            >
              <Icon size={14} strokeWidth={2.2} className={tone.icon} />
            </span>
            <div className="flex min-w-0 flex-col">
              <h3 className="truncate text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">
                {metric.label}
              </h3>
              <p
                className={`mt-0.5 truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] ${tone.text}`}
              >
                {metric.value}
              </p>
              <p className="mt-px truncate text-[10.5px] text-muted">{metric.sub}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
