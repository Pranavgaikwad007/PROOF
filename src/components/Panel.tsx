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

export function Panel({ title, icon: Icon, subtitle, actions, children, className = '', bodyClassName = '' }: PanelProps) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card ${className}`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
        {Icon ? (
          <Icon size={14} className="shrink-0 text-muted" strokeWidth={2} aria-hidden="true" />
        ) : null}
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="shrink-0 whitespace-nowrap text-[12px] font-semibold tracking-[0.01em] text-ink">
            {title}
          </h2>
          {subtitle ? (
            <span className="hidden min-w-0 truncate text-[11px] text-muted sm:inline">{subtitle}</span>
          ) : null}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">{actions}</div>
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
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
  accent: 'border-accent/20 bg-accentSoft text-accent',
  success: 'border-success/20 bg-successSoft text-success',
  danger: 'border-danger/20 bg-dangerSoft text-danger',
  violet: 'border-violet/20 bg-violetSoft text-violet',
  amber: 'border-amber/20 bg-amberSoft text-amber',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[5px] border px-1.5 py-[2px] text-[10px] font-semibold leading-none tracking-[0.02em] ${toneClasses[tone]} ${className}`}
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
}: QuietButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? (typeof children === 'string' ? children : title)}
      aria-expanded={ariaExpanded}
      className={`inline-flex h-7 items-center gap-1.5 rounded-[6px] border px-2 text-[11px] font-medium transition-colors ${
        active
          ? 'border-accent/30 bg-accentSoft text-accent'
          : 'border-line bg-surface text-muted hover:border-line-strong hover:bg-surface-2 hover:text-ink'
      } ${className}`}
    >
      {Icon ? <Icon size={13} strokeWidth={2} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
