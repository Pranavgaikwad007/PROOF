import {
  Bot,
  ChevronLeft,
  ClipboardList,
  FileSearch,
  Files,
  FlaskConical,
  LayoutDashboard,
  LayoutList,
  MessageSquare,
  Network,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CandidateInfo, NavItemId } from '../types/assessment';

interface NavItem {
  id: NavItemId;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'buildtrail', label: 'BuildTrail', icon: LayoutList },
  { id: 'evidence-inspector', label: 'Evidence Inspector', icon: FileSearch },
  { id: 'decision-graph', label: 'Decision Graph', icon: Network },
  { id: 'ai-interactions', label: 'AI Interactions', icon: Bot },
  { id: 'test-results', label: 'Test Results', icon: FlaskConical },
  { id: 'code-revisions', label: 'Code Revisions', icon: Files },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

interface SidebarProps {
  candidate: CandidateInfo;
  activeNav: NavItemId;
  onNavSelect: (id: NavItemId) => void;
  onBack: () => void;
  onCloseDrawer?: () => void;
  drawer?: boolean;
}

/*
 * The sidebar is intentionally dark navy in BOTH themes. It uses the dedicated
 * `nav-*` tokens (identical under :root and .dark) rather than the workspace
 * surface/ink tokens, so toggling the theme never turns it white.
 */
export function Sidebar({
  candidate,
  activeNav,
  onNavSelect,
  onBack,
  onCloseDrawer,
  drawer = false,
}: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-nav-bg">
      {/* Brand header */}
      <div className="flex items-center gap-2 bg-nav-header px-4 py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-accent text-white">
          <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-none tracking-[0.08em] text-nav-text">PROOF</p>
          <p className="mt-1 truncate text-[9.5px] font-medium leading-none tracking-[0.04em] text-nav-muted">
            Evidence-Driven Assessment
          </p>
        </div>
        {drawer && onCloseDrawer ? (
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="Close navigation"
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-nav-muted transition-colors hover:bg-nav-hover hover:text-nav-text"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Candidate summary */}
      <div className="mx-3 mb-3 mt-3 rounded-[7px] border border-nav-line bg-nav-header/70 p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nav-active text-[11px] font-bold text-nav-text">
            {candidate.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold leading-tight text-nav-text">
              {candidate.name}
            </p>
            <p className="truncate text-[10.5px] leading-tight text-nav-muted">{candidate.role}</p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-[5px] border border-success/25 bg-success/15 px-1.5 py-[2px] text-[10px] font-semibold leading-none text-nav-text">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            {candidate.status}
          </span>
          <span className="inline-flex items-center rounded-[5px] border border-nav-line bg-nav-hover px-1.5 py-[2px] font-mono text-[10px] font-semibold leading-none text-nav-muted">
            {candidate.duration}
          </span>
        </div>

        <dl className="mt-2.5 space-y-1 border-t border-nav-line pt-2.5 text-[10px]">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="shrink-0 text-nav-muted">Started</dt>
            <dd className="truncate font-medium text-nav-text">{candidate.startedAt}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="shrink-0 text-nav-muted">Assessment</dt>
            <dd className="truncate font-medium text-nav-text">{candidate.assessment}</dd>
          </div>
        </dl>
      </div>

      {/* Workspace navigation */}
      <nav aria-label="Assessment sections" className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <p className="px-2 pb-1.5 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-nav-faint">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = item.id === activeNav;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavSelect(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-[6px] px-2 py-[7px] text-left text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-nav-active text-nav-text'
                      : 'text-nav-muted hover:bg-nav-hover hover:text-nav-text'
                  }`}
                >
                  <Icon
                    size={14}
                    strokeWidth={2}
                    className={active ? 'text-white' : 'text-nav-faint'}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                  {active ? (
                    <span
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back action */}
      <div className="border-t border-nav-line p-3">
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center justify-center gap-1.5 rounded-[6px] border border-nav-line bg-nav-header px-3 py-2 text-[11.5px] font-medium text-nav-muted transition-colors hover:border-nav-hover hover:bg-nav-hover hover:text-nav-text"
        >
          <ChevronLeft size={13} strokeWidth={2} aria-hidden="true" />
          Back to Assessments
        </button>
      </div>
    </div>
  );
}
