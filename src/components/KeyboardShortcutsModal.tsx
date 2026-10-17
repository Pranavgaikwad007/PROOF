import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      group: 'Workspace & Layout',
      items: [
        { keys: ['['], label: 'Collapse / Expand Sidebar' },
        { keys: ['M'], label: 'Toggle Code Focus / Zen Mode' },
        { keys: ['T'], label: 'Toggle Light / Dark Theme' },
        { keys: ['?'], label: 'Toggle Keyboard Shortcuts' },
        { keys: ['Esc'], label: 'Close Modals / Overlays' },
      ],
    },
    {
      group: 'Navigation & Direct Views',
      items: [
        { keys: ['1'], label: 'Overview & Mission Brief' },
        { keys: ['2'], label: 'BuildTrail Events Timeline' },
        { keys: ['3'], label: 'Evidence Inspector Workspace' },
        { keys: ['4'], label: 'Recruiter Reports' },
        { keys: ['5'], label: 'Candidate Feedback' },
      ],
    },
    {
      group: 'Actions',
      items: [
        { keys: ['R'], label: 'Cycle Next Code Revision (R1 → R2 → R3)' },
        { keys: ['E'], label: 'Export Evaluation Report (Markdown)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="proof-fade-in relative z-10 w-full max-w-[560px] rounded-card border border-line bg-surface p-5 shadow-pop"
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-accentSoft text-accent">
              <Keyboard size={18} />
            </span>
            <div>
              <h2 id="shortcuts-title" className="text-[16px] font-bold text-ink">
                Desktop Keyboard Shortcuts
              </h2>
              <p className="text-[13px] text-muted">
                Navigate PROJECT PROOF with native desktop productivity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-line text-muted hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {shortcuts.map((section) => (
            <div key={section.group}>
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                {section.group}
              </h3>
              <div className="mt-2 divide-y divide-line/60 rounded-[6px] border border-line bg-surface-2">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-h-[36px] items-center justify-between px-3.5 py-2 text-[13px]"
                  >
                    <span className="text-ink">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="flex min-h-[24px] min-w-[24px] items-center justify-center rounded-[4px] border border-line bg-surface px-2 py-0.5 font-mono text-[12px] font-bold text-ink shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12px] text-muted">
          <span>Shortcuts disabled while typing in text inputs</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[32px] items-center justify-center rounded-[6px] border border-line bg-surface px-4 py-1 text-[13px] font-medium text-ink hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
