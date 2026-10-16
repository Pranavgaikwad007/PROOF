import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from './components/AppLayout';
import { BuildTrail, categoryMeta } from './components/BuildTrail';
import { DecisionGraph } from './components/DecisionGraph';
import { FindingDetails } from './components/FindingDetails';
import { RevisionDiff } from './components/RevisionDiff';
import { SummaryMetrics } from './components/SummaryMetrics';
import { assessment } from './data/assessment';
import { applyTheme, getInitialTheme } from './lib/theme';
import { buildReportMarkdown, downloadTextFile } from './lib/exportReport';
import type {
  BuildEvent,
  DiffTab,
  EventCategory,
  NavItemId,
  RevisionId,
  SupportingEvidenceItem,
} from './types/assessment';

const allCategories = Object.keys(categoryMeta) as EventCategory[];

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItemId>('evidence-inspector');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionId>('R2');
  const [activeTab, setActiveTab] = useState<DiffTab>('evidence');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>('evt-008');
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    () => new Set(allCategories),
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const handleToggleCategory = useCallback((category: EventCategory) => {
    setActiveCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveCategories(new Set(allCategories));
  }, []);

  const focusEvent = useCallback((event: BuildEvent) => {
    setHighlightedEventId(event.id);
    if (event.revision) setSelectedRevision(event.revision);
    if (event.evidenceId) {
      setSelectedEvidenceId(event.evidenceId);
      const item = assessment.finding.evidence.find((entry) => entry.id === event.evidenceId);
      if (item) setActiveTab(item.action === 'output' ? 'tests' : item.action === 'diff' ? 'diff' : 'ai');
    }
  }, []);

  const handleSelectEvent = useCallback(
    (event: BuildEvent) => focusEvent(event),
    [focusEvent],
  );

  const handleGraphSelect = useCallback(
    (eventId: string) => {
      const event = assessment.events.find((item) => item.id === eventId);
      if (event) focusEvent(event);
    },
    [focusEvent],
  );

  const handleEvidenceSelect = useCallback((item: SupportingEvidenceItem) => {
    setSelectedEvidenceId(item.id);
    setHighlightedEventId(item.eventId);
    if (item.revision) setSelectedRevision(item.revision);
    setActiveTab(
      item.action === 'output' ? 'tests' : item.action === 'diff' ? 'diff' : 'ai',
    );
  }, []);

  const handleNavSelect = useCallback(
    (id: NavItemId) => {
      setActiveNav(id);
      if (id !== 'evidence-inspector') {
        showToast(`"${id}" is not wired up in this prototype — Evidence Inspector stays active.`);
      }
    },
    [showToast],
  );

  const handleBack = useCallback(() => {
    showToast('Back to Assessments is disabled in the Step 1 prototype.');
  }, [showToast]);

  const handleExport = useCallback(() => {
    const markdown = buildReportMarkdown(assessment);
    downloadTextFile(
      `proof-report-${assessment.candidate.submissionId}.md`,
      markdown,
      'text/markdown;charset=utf-8',
    );
    showToast('Sample report downloaded as Markdown.');
  }, [showToast]);

  const handleShare = useCallback(() => {
    const link = `${window.location.origin}${window.location.pathname}#submission/${assessment.candidate.submissionId}`;
    const fallback = () => {
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('Share link copied to clipboard.');
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(link)
        .then(() => showToast('Share link copied to clipboard.'))
        .catch(fallback);
    } else {
      fallback();
    }
  }, [showToast]);

  /*
   * Persistence lives in the toggle handler, never in the render effect: an
   * effect can fire more than once per mount (StrictMode double-invokes it),
   * which would silently write the resolved system preference and lock the user
   * out of following later OS theme changes.
   */
  const handleToggleTheme = useCallback(() => {
    const next: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
    setTheme(next);
  }, [theme]);

  // Reflect theme changes in the DOM without touching storage.
  useEffect(() => {
    applyTheme(theme, false);
  }, [theme]);

  const graph = useMemo(() => assessment.graph, []);

  return (
    <AppLayout
      candidate={assessment.candidate}
      activeNav={activeNav}
      onNavSelect={handleNavSelect}
      onBack={handleBack}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      onExport={handleExport}
      onShare={handleShare}
      sidebarOpen={sidebarOpen}
      onOpenSidebar={() => setSidebarOpen(true)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {/*
        At xl+ the workspace is a single row of three columns, so an explicit
        `minmax(0,1fr)` row pins it to the space left after the summary cards —
        the cards stay above the fold and each panel scrolls its own body.
        Below xl the panels stack into several rows, which must size to their
        content instead, so the page scrolls rather than overlapping.
      */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2 xl:min-h-0 xl:grid-cols-[236px_minmax(0,1fr)_272px] xl:grid-rows-[minmax(0,1fr)] 2xl:grid-cols-[268px_minmax(0,1fr)_308px]">
          <div className="order-2 flex min-h-0 min-w-0 xl:order-1">
            <BuildTrail
              events={assessment.events}
              activeCategories={activeCategories}
              onToggleCategory={handleToggleCategory}
              onClearFilters={handleClearFilters}
              highlightedEventId={highlightedEventId}
              onSelectEvent={handleSelectEvent}
            />
          </div>

          <div className="order-1 flex min-h-0 min-w-0 flex-col gap-3 lg:order-1 lg:col-span-2 xl:order-2 xl:col-span-1">
            <DecisionGraph graph={graph} theme={theme} onSelectEventId={handleGraphSelect} />
            <RevisionDiff
              revisions={assessment.revisions}
              selectedRevision={selectedRevision}
              onRevisionChange={setSelectedRevision}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              testRuns={assessment.testRuns}
              aiExchanges={assessment.aiExchanges}
              focusAnnotation={selectedEvidenceId !== null}
            />
          </div>

          <div className="order-3 flex min-h-0 min-w-0">
            <FindingDetails
              finding={assessment.finding}
              selectedEvidenceId={selectedEvidenceId}
              onSelectEvidence={handleEvidenceSelect}
            />
          </div>
        </div>

        <div className="shrink-0 pt-3">
          <SummaryMetrics metrics={assessment.summary} />
        </div>

        <p className="shrink-0 pt-3 text-[10px] leading-relaxed text-muted">
          Evidence records observable actions, outputs, and timestamps captured during the assessment.
          It does not establish a candidate&rsquo;s private reasoning or prove sole causation for any
          outcome. All values shown are illustrative sample data for the prototype.
        </p>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="proof-fade-in fixed bottom-4 right-4 z-[60] flex max-w-[340px] items-start gap-2 rounded-card border border-line bg-surface px-3 py-2.5 shadow-pop"
        >
          <CheckCircle2 size={14} className="mt-px shrink-0 text-success" aria-hidden="true" />
          <p className="text-[11.5px] leading-snug text-ink">{toast}</p>
        </div>
      ) : null}
    </AppLayout>
  );
}
