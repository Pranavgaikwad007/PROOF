import { useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import { askAiCoach } from '../../lib/api';
import type { AiExchange, RevisionId } from '../../types/assessment';
import { Badge, Panel } from '../Panel';

interface AiInteractionsViewProps {
  submissionId: string;
  exchanges: AiExchange[];
  activeRevision: RevisionId;
  onNewExchange: (exchange: AiExchange) => void;
  showToast: (msg: string) => void;
}

export function AiInteractionsView({
  submissionId,
  exchanges,
  activeRevision,
  onNewExchange,
  showToast,
}: AiInteractionsViewProps) {
  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || promptText;
    if (!textToSend.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const exchange = await askAiCoach(submissionId, textToSend, activeRevision);
      onNewExchange(exchange);
      setPromptText('');
      showToast('AI Coach responded.');
    } catch (err: any) {
      showToast(`Error: ${err.message || 'Failed to get response'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePrompts = [
    'How should I structure the binary search algorithm?',
    'Why does my search fail on boundary or empty inputs?',
    'Can you explain why `left < right` exits before the final element?',
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden">
      <Panel
        title="AI Coach Interaction Timeline"
        icon={Bot}
        subtitle={`${exchanges.length} recorded dialogue exchanges · Policy Level 3`}
        className="flex min-h-0 flex-1 flex-col"
        bodyClassName="flex flex-col min-h-0 flex-1"
      >
        {/* Dialogue scroll area */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ol className="relative space-y-3">
            <span className="absolute bottom-3 left-[15px] top-3 w-px bg-line" aria-hidden="true" />
            {exchanges.map((item) => {
              const isCandidate = item.role === 'candidate';
              return (
                <li key={item.id} className="relative pl-9">
                  <span
                    className={`absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border bg-surface shadow-card ${
                      isCandidate ? 'border-line' : 'border-violet/30 bg-violetSoft'
                    }`}
                  >
                    {isCandidate ? (
                      <User size={13} className="text-muted" strokeWidth={2.2} />
                    ) : (
                      <Bot size={14} className="text-violet" strokeWidth={2.2} />
                    )}
                  </span>
                  <div className="rounded-card border border-line bg-surface p-4 shadow-card">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[14px] font-semibold text-ink">
                        {isCandidate ? 'Candidate' : 'AI Coach'}
                      </span>
                      <Badge tone={isCandidate ? 'neutral' : 'violet'}>
                        {isCandidate ? 'Inquiry' : 'Guidance'}
                      </Badge>
                      <span className="ml-auto font-mono text-[12px] text-muted">{item.time}</span>
                    </div>
                    <p className="mt-2.5 text-[14px] leading-relaxed text-ink">{item.text}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line/50 pt-2 font-mono text-[12px] text-muted">
                      <span>Event Ref: <strong className="text-ink">{item.eventId}</strong></span>
                      {item.relatedRevision ? (
                        <span>· Context Revision: <strong className="text-ink">{item.relatedRevision}</strong></span>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Live Prompt Box */}
        <div className="border-t border-line bg-surface-2 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
              <Sparkles size={14} className="text-violet" /> Suggested questions:
            </span>
            {samplePrompts.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => handleSend(sp)}
                disabled={isSubmitting}
                className="inline-flex min-h-[32px] items-center rounded-[6px] border border-line bg-surface px-3 py-1 text-[12px] font-medium text-ink transition-colors hover:border-accent hover:bg-accentSoft hover:text-accent disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent"
              >
                {sp}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask the AI Coach for guidance or error root cause analysis..."
              disabled={isSubmitting}
              className="flex-1 min-h-[40px] rounded-[6px] border border-line bg-surface px-3.5 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={isSubmitting || !promptText.trim()}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-[6px] bg-accent px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Ask Coach
            </button>
          </form>
          <p className="mt-2 text-[12px] text-muted">
            Responses are policy-gated at Level 3 · Verify (Levels 1-2 included). Inquiries are recorded into the BuildTrail.
          </p>
        </div>
      </Panel>
    </div>
  );
}
