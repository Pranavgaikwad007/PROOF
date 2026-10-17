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
    iconBg: 'bg-successSoft border-success/30',
  },
  accent: {
    text: 'text-accent',
    icon: 'text-accent',
    iconBg: 'bg-accentSoft border-accent/30',
  },
  violet: {
    text: 'text-violet',
    icon: 'text-violet',
    iconBg: 'bg-violetSoft border-violet/30',
  },
  amber: {
    text: 'text-amber',
    icon: 'text-amber',
    iconBg: 'bg-amberSoft border-amber/30',
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
  // Show up to 5 cards cleanly in one row without overflow buttons
  const displayMetrics = metrics.slice(0, 5);

  return (
    <section aria-label="Assessment summary" className="py-2.5 sm:py-3">
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {displayMetrics.map((metric) => {
          const tone = toneMap[metric.tone];
          const Icon = metricIcons[metric.id] ?? BarChart3;
          return (
            <article
              key={metric.id}
              className="flex min-w-0 items-center gap-3.5 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition-all duration-150 hover:border-line-strong hover:shadow-pop"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border ${tone.iconBg}`}
                aria-hidden="true"
              >
                <Icon size={18} strokeWidth={2.2} className={tone.icon} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h3 className="truncate text-[13px] font-semibold uppercase tracking-[0.05em] text-muted">
                  {metric.label}
                </h3>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <p className={`truncate text-[22px] sm:text-[24px] font-bold leading-tight ${tone.text}`}>
                    {metric.value}
                  </p>
                  <span className="truncate font-mono text-[12px] text-muted">{metric.sub}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
