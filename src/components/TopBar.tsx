import { Download, Menu, Moon, Share2, Sun } from 'lucide-react';
import type { CandidateInfo } from '../types/assessment';
import { QuietButton } from './Panel';

interface TopBarProps {
  candidate: CandidateInfo;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onExport: () => void;
  onShare: () => void;
  onOpenMenu: () => void;
}

export function TopBar({ candidate, theme, onToggleTheme, onExport, onShare, onOpenMenu }: TopBarProps) {
  const crumbs = ['Assessments', candidate.assessment, 'Evidence Inspector'];

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-3 py-2 sm:px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-line text-muted hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu size={15} aria-hidden="true" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 text-[11.5px]">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={crumb} className="flex min-w-0 items-center gap-1.5">
                {index > 0 ? (
                  <span className="text-faint" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {last ? (
                  <span className="truncate font-semibold text-ink" aria-current="page">
                    {crumb}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="truncate rounded text-muted transition-colors hover:text-accent"
                  >
                    {crumb}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-0.5 hidden text-[10px] text-muted md:block">
          Submission <span className="font-medium text-ink">{candidate.submissionId}</span>
        </p>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <QuietButton icon={Download} onClick={onExport} title="Download a sample Markdown report">
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </QuietButton>
        <QuietButton icon={Share2} onClick={onShare} title="Copy a shareable link to this assessment">
          <span className="hidden sm:inline">Share</span>
        </QuietButton>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-ink"
        >
          {theme === 'light' ? (
            <Moon size={13} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Sun size={13} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
        <div className="ml-1 flex items-center gap-2 border-l border-line pl-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-surface"
            title={candidate.name}
          >
            {candidate.initials}
          </span>
        </div>
      </div>
    </header>
  );
}
