import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  icon?: LucideIcon;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({
  title,
  icon: Icon,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = '',
}: PanelProps) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card ${className}`}
    >
      <header className="flex min-h-[46px] shrink-0 items-center gap-2.5 border-b border-line px-4 py-2.5">
        {Icon ? (
          <Icon size={16} className="shrink-0 text-muted" strokeWidth={2} aria-hidden="true" />
        ) : null}
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="shrink-0 whitespace-nowrap text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h2>
          {subtitle ? (
            <span className="hidden min-w-0 truncate text-[13px] text-muted sm:inline">{subtitle}</span>
          ) : null}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
      </header>
      <div className={`flex min-h-0 flex-1 flex-col ${bodyClassName}`}>{children}</div>
    </section>
  );
}

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'violet' | 'amber';
  className?: string;
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'border-line bg-surface-2 text-muted',
  accent: 'border-accent/25 bg-accentSoft text-accent',
  success: 'border-success/30 bg-successSoft text-success',
  danger: 'border-danger/30 bg-dangerSoft text-danger',
  violet: 'border-violet/30 bg-violetSoft text-violet',
  amber: 'border-amber/30 bg-amberSoft text-amber',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-[24px] items-center gap-1.5 rounded-[6px] border px-2.5 py-0.5 text-[12px] font-semibold leading-none tracking-[0.01em] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

interface QuietButtonProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  title?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  active?: boolean;
  className?: string;
  primary?: boolean;
}

export function QuietButton({
  children,
  onClick,
  icon: Icon,
  title,
  ariaLabel,
  ariaExpanded,
  active = false,
  className = '',
  primary = false,
}: QuietButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? (typeof children === 'string' ? children : title)}
      aria-expanded={ariaExpanded}
      className={`inline-flex items-center justify-center gap-2 rounded-[6px] border text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        primary
          ? 'min-h-[38px] px-4 bg-accent text-white border-accent hover:bg-accent/90 shadow-sm'
          : `min-h-[32px] px-3.5 ${
              active
                ? 'border-accent/40 bg-accentSoft text-accent font-semibold'
                : 'border-line bg-surface text-muted hover:border-line-strong hover:bg-surface-2 hover:text-ink'
            }`
      } ${className}`}
    >
      {Icon ? <Icon size={14} strokeWidth={2} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
