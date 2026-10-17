import { CheckCircle2, Clock, FileCode, Layers, X } from 'lucide-react';
import type { CandidateInfo } from '../types/assessment';

interface AssessmentSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessments: CandidateInfo[];
  currentSubmissionId: string;
  onSelect: (submissionId: string) => void;
}

export function AssessmentSwitcherModal({
  isOpen,
  onClose,
  assessments,
  currentSubmissionId,
  onSelect,
}: AssessmentSwitcherModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="proof-fade-in flex max-h-[85vh] w-full max-w-[620px] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-pop">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Layers size={18} className="text-accent" />
            <h2 className="text-[16px] font-semibold text-ink">Select Assessment Submission</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-muted hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Choose an assessment from the database to inspect its telemetry, code diffs, and generated evidence.
          </p>

          <div className="space-y-3">
            {assessments.map((item) => {
              const active = item.submissionId === currentSubmissionId;
              return (
                <div
                  key={item.submissionId}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelect(item.submissionId);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(item.submissionId);
                      onClose();
                    }
                  }}
                  className={`cursor-pointer rounded-card border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? 'border-accent bg-accentSoft/30 ring-1 ring-accent'
                      : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] font-bold text-accent">
                          {item.submissionId}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-[4px] border border-success/30 bg-[#DCFCE7] px-2 py-0.5 text-[12px] font-semibold text-[#15803D]">
                          <CheckCircle2 size={12} />
                          {item.status}
                        </span>
                        {active ? (
                          <span className="rounded-[4px] bg-accent px-2 py-0.5 text-[12px] font-bold text-white">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 text-[15px] font-semibold text-ink">
                        {item.assessment}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
                        {item.problem}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line/60 pt-2.5 text-[12px] text-muted">
                    <span className="flex items-center gap-1.5">
                      <FileCode size={14} className="text-muted" />
                      Candidate: <strong className="font-semibold text-ink">{item.name}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-muted" />
                      Duration: <span className="font-mono">{item.duration}</span>
                    </span>
                    <span className="ml-auto font-mono text-[12px] text-muted">{item.startedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex justify-end border-t border-line bg-surface-2 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[32px] items-center justify-center rounded-[6px] border border-line bg-surface px-4 py-1.5 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
