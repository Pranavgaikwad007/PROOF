import { BarChart3, CheckCircle2, Clock3, Eye, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SummaryMetric } from '../types/assessment';

const shortLabels: Record<string, string> = {
  'Objective Results': 'Tests',
  'Performance': 'Duration',
  'Evidence Coverage': 'Coverage',
  'Observations': 'Findings',
  'Review Status': 'Review',
  'm-1': 'Tests',
  'm-2': 'Duration',
  'm-3': 'Coverage',
  'm-4': 'Findings',
  'm-5': 'Review',
};

interface ToneStyle {
  text: string;
  icon: string;
  iconBg: string;
}

const neutralStyle: ToneStyle = {
  text: 'text-ink',
  icon: 'text-muted',
  iconBg: 'bg-surface-2 border-line',
};

const semanticStyles: Record<'success' | 'amber' | 'danger', ToneStyle> = {
  success: {
    text: 'text-success',
    icon: 'text-success',
    iconBg: 'bg-successSoft border-success/30',
  },
  amber: {
    text: 'text-amber',
    icon: 'text-amber',
    iconBg: 'bg-amberSoft border-amber/30',
  },
  danger: {
    text: 'text-danger',
    icon: 'text-danger',
    iconBg: 'bg-dangerSoft border-danger/30',
  },
};

const metricIcons: Record<string, LucideIcon> = {
  'm-1': CheckCircle2,
  'm-2': Clock3,
  'm-3': BarChart3,
  'm-4': Eye,
  'm-5': ShieldCheck,
};

function getMetricStyle(metric: SummaryMetric): ToneStyle {
  const isStateMetric =
    metric.id === 'm-1' ||
    metric.id === 'm-5' ||
    metric.label.toLowerCase().includes('test') ||
    metric.label.toLowerCase().includes('review');

  if (isStateMetric) {
    const val = (metric.value || '').toLowerCase();
    const sub = (metric.sub || '').toLowerCase();
    const tone = metric.tone;

    if (val.includes('pass') || tone === 'success') {
      return semanticStyles.success;
    }
    if (val.includes('pend') || sub.includes('await') || tone === 'amber') {
      return semanticStyles.amber;
    }
    if (val.includes('fail') || (tone as string) === 'danger') {
      return semanticStyles.danger;
    }
  }

  return neutralStyle;
}

export function SummaryMetrics({ metrics }: { metrics: SummaryMetric[] }) {
  const displayMetrics = metrics.slice(0, 5);

  return (
    <section aria-label="Assessment summary" className="py-2.5 sm:py-3">
      {/* 5 cards on wide screens (2xl:), 3+2 wrap at 1366px (xl:), 2-col at 1024px (lg:), 1-col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3.5">
        {displayMetrics.map((metric) => {
          const tone = getMetricStyle(metric);
          const Icon = metricIcons[metric.id] ?? BarChart3;
          const label = shortLabels[metric.label] || shortLabels[metric.id] || metric.label;

          return (
            <article
              key={metric.id}
              className="flex min-w-0 items-center gap-3.5 rounded-card border border-line bg-surface p-4 shadow-card transition-all duration-150 hover:border-line-strong hover:shadow-pop"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border ${tone.iconBg}`}
                aria-hidden="true"
              >
                <Icon size={19} strokeWidth={2.2} className={tone.icon} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                {/* Line 1: Big value (22-24px bold, nowrap, never ellipsize) */}
                <div
                  className={`text-[22px] sm:text-[24px] font-bold leading-tight tracking-tight whitespace-nowrap ${tone.text}`}
                >
                  {metric.value}
                </div>
                {/* Line 2: Small label UNDER it (13px) */}
                <div className="mt-0.5 text-[13px] font-semibold text-ink/80 whitespace-nowrap">
                  {label}
                </div>
                {/* Line 3: Tiny support caption */}
                <div className="mt-0.5 text-[12px] text-muted whitespace-nowrap">
                  {metric.sub}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
