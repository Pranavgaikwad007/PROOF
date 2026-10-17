import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { AppLayout } from './components/AppLayout';
import { AssessmentSwitcherModal } from './components/AssessmentSwitcherModal';
import { BuildTrail, categoryMeta } from './components/BuildTrail';
import { DecisionGraph } from './components/DecisionGraph';
import { FindingDetails } from './components/FindingDetails';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { RevisionDiff } from './components/RevisionDiff';
import { SummaryMetrics } from './components/SummaryMetrics';
import { QuietButton } from './components/Panel';
import { AiInteractionsView } from './components/views/AiInteractionsView';
import { FeedbackView } from './components/views/FeedbackView';
import { OverviewView } from './components/views/OverviewView';
import { ReportsView } from './components/views/ReportsView';
import { TestResultsView } from './components/views/TestResultsView';
import { assessment as fallbackAssessment } from './data/assessment';
import {
  fetchAssessment,
  fetchAssessments,
  fetchReportMarkdown,
  fetchShareLink,
} from './lib/api';
import { buildReportMarkdown, downloadTextFile } from './lib/exportReport';
import { applyTheme, getInitialTheme } from './lib/theme';
import type {
  AiExchange,
  AssessmentData,
  BuildEvent,
  CandidateInfo,
  DiffTab,
  EventCategory,
  NavItemId,
  RevisionId,
  SupportingEvidenceItem,
  TestRun,
} from './types/assessment';

const allCategories = Object.keys(categoryMeta) as EventCategory[];

function getHashSubmissionId(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (hash.startsWith('#submission/')) {
    return hash.replace('#submission/', '').trim();
  }
  return null;
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItemId>('evidence-inspector');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1280;
  });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFindingDrawerOpen, setIsFindingDrawerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 1280) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isWideScreen = windowWidth >= 1440;

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

  // Live Data State
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>(
    () => getHashSubmissionId() || 'ASM-3088-TASK',
  );
  const [data, setData] = useState<AssessmentData>(fallbackAssessment);
  const [assessmentsList, setAssessmentsList] = useState<CandidateInfo[]>([
    fallbackAssessment.candidate,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Clean up toast timer
  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch assessment list for switcher
  useEffect(() => {
    fetchAssessments().then((res) => {
      if (res.items && res.items.length > 0) {
        setAssessmentsList(res.items);
      }
    });
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const onHashChange = () => {
      const hashId = getHashSubmissionId();
      if (hashId && hashId !== currentSubmissionId) {
        setCurrentSubmissionId(hashId);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [currentSubmissionId]);

  // Fetch active assessment data from backend
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchAssessment(currentSubmissionId)
      .then((loadedData) => {
        if (!active) return;
        setData(loadedData);
        // Reset selections to first revision of loaded assessment
        if (loadedData.revisions.length > 0) {
          const revId =
            loadedData.revisions.find((r) => r.id === 'R2')?.id || loadedData.revisions[0].id;
          setSelectedRevision(revId);
        }
        if (loadedData.finding?.evidence && loadedData.finding.evidence.length > 0) {
          setSelectedEvidenceId(loadedData.finding.evidence[0].id);
        } else {
          setSelectedEvidenceId(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load assessment:', err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentSubmissionId]);

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

  const focusEvent = useCallback(
    (event: BuildEvent) => {
      setHighlightedEventId(event.id);
      if (event.revision) setSelectedRevision(event.revision);
      if (event.evidenceId) {
        setSelectedEvidenceId(event.evidenceId);
        const item = data.finding.evidence.find((entry) => entry.id === event.evidenceId);
        if (item) setActiveTab(item.action === 'output' ? 'tests' : item.action === 'diff' ? 'diff' : 'ai');
      }
    },
    [data.finding.evidence],
  );

  const handleSelectEvent = useCallback(
    (event: BuildEvent) => focusEvent(event),
    [focusEvent],
  );

  const handleGraphSelect = useCallback(
    (eventId: string) => {
      const event = data.events.find((item) => item.id === eventId);
      if (event) focusEvent(event);
    },
    [data.events, focusEvent],
  );

  const handleEvidenceSelect = useCallback((item: SupportingEvidenceItem) => {
    setSelectedEvidenceId(item.id);
    setHighlightedEventId(item.eventId);
    if (item.revision) setSelectedRevision(item.revision);
    setActiveTab(item.action === 'output' ? 'tests' : item.action === 'diff' ? 'diff' : 'ai');
    setActiveNav('evidence-inspector');
    if (window.innerWidth < 1440) {
      setIsFindingDrawerOpen(false);
    }
  }, []);

  const handleNavSelect = useCallback((id: NavItemId) => {
    setActiveNav(id);
  }, []);

  const handleBack = useCallback(() => {
    setIsSwitcherOpen(true);
  }, []);

  const handleSelectAssessment = useCallback((submissionId: string) => {
    window.location.hash = `#submission/${submissionId}`;
    setCurrentSubmissionId(submissionId);
    showToast(`Switched to assessment ${submissionId}`);
  }, [showToast]);

  const handleExport = useCallback(async () => {
    try {
      let markdown = await fetchReportMarkdown(data.candidate.submissionId);
      if (!markdown) {
        markdown = buildReportMarkdown(data);
      }
      downloadTextFile(
        `proof-report-${data.candidate.submissionId}.md`,
        markdown,
        'text/markdown;charset=utf-8',
      );
      showToast('Assessment report downloaded as Markdown.');
    } catch {
      const fallbackMd = buildReportMarkdown(data);
      downloadTextFile(
        `proof-report-${data.candidate.submissionId}.md`,
        fallbackMd,
        'text/markdown;charset=utf-8',
      );
      showToast('Report downloaded as Markdown.');
    }
  }, [data, showToast]);

  const handleShare = useCallback(async () => {
    try {
      const link = await fetchShareLink(data.candidate.submissionId);
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.createElement('input');
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      showToast('Share link copied to clipboard.');
    } catch {
      showToast('Failed to copy share link.');
    }
  }, [data.candidate.submissionId, showToast]);

  // Handle new live AI exchange from AiInteractionsView
  const handleNewExchange = useCallback((newExchange: AiExchange) => {
    setData((prev) => ({
      ...prev,
      aiExchanges: [...prev.aiExchanges, newExchange],
    }));
  }, []);

  // Handle new live test run from TestResultsView
  const handleNewTestRun = useCallback((newRun: TestRun) => {
    setData((prev) => ({
      ...prev,
      testRuns: [...prev.testRuns, newRun],
    }));
  }, []);

  const handleToggleTheme = useCallback(() => {
    const next: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    applyTheme(next, true);
    setTheme(next);
  }, [theme]);

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleExport();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (data.revisions.length > 0) {
          const revIndex = data.revisions.findIndex((r) => r.id === selectedRevision);
          const nextIndex = (revIndex + 1) % data.revisions.length;
          setSelectedRevision(data.revisions[nextIndex].id);
          showToast(`Revision ${data.revisions[nextIndex].id}`);
        }
      } else if (e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key, 10) - 1;
        const navList: NavItemId[] = [
          'overview',
          'buildtrail',
          'evidence-inspector',
          'reports',
          'feedback',
        ];
        if (index < navList.length) {
          e.preventDefault();
          setActiveNav(navList[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.revisions, selectedRevision, handleToggleTheme, handleExport, showToast]);

  const graph = useMemo(() => data.graph, [data.graph]);

  return (
    <AppLayout
      candidate={data.candidate}
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
      onOpenSwitcher={() => setIsSwitcherOpen(true)}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
    >
      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center gap-2 text-muted">
          <Loader2 size={18} className="animate-spin text-accent" />
          <span className="text-[12px] font-medium">Loading assessment from backend...</span>
        </div>
      ) : null}

      {!isLoading && activeNav === 'evidence-inspector' && (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          {/* Top KPI Metrics Row */}
          <div className="shrink-0">
            <SummaryMetrics metrics={data.summary} />
          </div>

          {/* Quick drawer banner when screen < 1440px */}
          {!isWideScreen && !isFocusMode ? (
            <div className="mb-3 flex items-center justify-between rounded-card border border-line bg-surface px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-ink">Primary Finding:</span>
                <span className="truncate text-[13px] text-muted">{data.finding.title}</span>
              </div>
              <QuietButton
                onClick={() => setIsFindingDrawerOpen(true)}
                title="Open Finding Details Drawer"
                className="min-h-[32px] px-3.5 text-[13px] font-semibold"
              >
                Inspect Finding ({data.finding.evidence.length} evidence)
              </QuietButton>
            </div>
          ) : null}

          {isFocusMode ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <RevisionDiff
                revisions={data.revisions}
                selectedRevision={selectedRevision}
                onRevisionChange={setSelectedRevision}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                testRuns={data.testRuns}
                aiExchanges={data.aiExchanges}
                focusAnnotation={selectedEvidenceId !== null}
                isFocusMode={isFocusMode}
                onToggleFocusMode={() => setIsFocusMode(false)}
              />
            </div>
          ) : isWideScreen ? (
            /* Full 4-zone Workspace (>= 1440px) */
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:min-h-0 xl:grid-cols-[300px_minmax(480px,1fr)_380px]">
              <div className="order-2 flex h-full min-h-[400px] min-w-0 xl:order-1 xl:min-h-0">
                <BuildTrail
                  events={data.events}
                  activeCategories={activeCategories}
                  onToggleCategory={handleToggleCategory}
                  onClearFilters={handleClearFilters}
                  highlightedEventId={highlightedEventId}
                  onSelectEvent={handleSelectEvent}
                />
              </div>

              <div className="order-1 flex h-full min-h-0 min-w-0 flex-col gap-4 lg:order-1 lg:col-span-2 xl:order-2 xl:col-span-1">
                <DecisionGraph graph={graph} theme={theme} onSelectEventId={handleGraphSelect} />
                <RevisionDiff
                  revisions={data.revisions}
                  selectedRevision={selectedRevision}
                  onRevisionChange={setSelectedRevision}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  testRuns={data.testRuns}
                  aiExchanges={data.aiExchanges}
                  focusAnnotation={selectedEvidenceId !== null}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={() => setIsFocusMode(true)}
                />
              </div>

              <div className="order-3 flex h-full min-h-[400px] min-w-0 xl:min-h-0">
                <FindingDetails
                  finding={data.finding}
                  selectedEvidenceId={selectedEvidenceId}
                  onSelectEvidence={handleEvidenceSelect}
                />
              </div>
            </div>
          ) : (
            /* 2-Column Workspace (< 1440px, e.g. 1366px laptop) */
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[280px_minmax(480px,1fr)]">
              <div className="flex h-full min-h-[400px] min-w-0 md:min-h-0">
                <BuildTrail
                  events={data.events}
                  activeCategories={activeCategories}
                  onToggleCategory={handleToggleCategory}
                  onClearFilters={handleClearFilters}
                  highlightedEventId={highlightedEventId}
                  onSelectEvent={handleSelectEvent}
                />
              </div>

              <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
                <DecisionGraph graph={graph} theme={theme} onSelectEventId={handleGraphSelect} />
                <RevisionDiff
                  revisions={data.revisions}
                  selectedRevision={selectedRevision}
                  onRevisionChange={setSelectedRevision}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  testRuns={data.testRuns}
                  aiExchanges={data.aiExchanges}
                  focusAnnotation={selectedEvidenceId !== null}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={() => setIsFocusMode(true)}
                />
              </div>
            </div>
          )}

          {/* Finding Details Slide-over Drawer for < 1440px screens */}
          {!isWideScreen && isFindingDrawerOpen ? (
            <div className="fixed inset-0 z-50 flex justify-end">
              <button
                type="button"
                aria-label="Close drawer overlay"
                onClick={() => setIsFindingDrawerOpen(false)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-[1px]"
              />
              <div className="proof-fade-in relative z-10 h-full w-[380px] max-w-full bg-surface shadow-pop">
                <FindingDetails
                  finding={data.finding}
                  selectedEvidenceId={selectedEvidenceId}
                  onSelectEvidence={handleEvidenceSelect}
                  onClose={() => setIsFindingDrawerOpen(false)}
                />
              </div>
            </div>
          ) : null}

          {/* Status bar — 12px #475569 on #F8FAFC with 6-8px padding per spec */}
          <div className="mt-3 flex shrink-0 items-center justify-between rounded-[6px] border border-line bg-surface-2 px-4 py-2 text-[12px] text-[#475569]">
            <p className="truncate">
              Evidence records observable actions, outputs, and timestamps captured during the assessment.
            </p>
            <span className="hidden font-mono text-[12px] text-[#475569] sm:inline">
              PROOF Assessment Engine v0.1.0
            </span>
          </div>
        </div>
      )}

      {!isLoading && activeNav === 'overview' && (
        <OverviewView data={data} onNavigate={handleNavSelect} />
      )}

      {!isLoading && activeNav === 'buildtrail' && (
        <div className="flex h-full min-h-0 flex-1 flex-col space-y-2.5 overflow-hidden">
          <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-2.5 lg:grid-cols-[340px_minmax(0,1fr)]">
            <BuildTrail
              events={data.events}
              activeCategories={activeCategories}
              onToggleCategory={handleToggleCategory}
              onClearFilters={handleClearFilters}
              highlightedEventId={highlightedEventId}
              onSelectEvent={handleSelectEvent}
            />
            <div className="flex h-full min-h-0 flex-col gap-2.5">
              <DecisionGraph graph={graph} theme={theme} onSelectEventId={handleGraphSelect} />
              <div className="min-h-0 flex-1 overflow-hidden">
                <RevisionDiff
                  revisions={data.revisions}
                  selectedRevision={selectedRevision}
                  onRevisionChange={setSelectedRevision}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  testRuns={data.testRuns}
                  aiExchanges={data.aiExchanges}
                  focusAnnotation={selectedEvidenceId !== null}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && activeNav === 'decision-graph' && (
        <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <DecisionGraph graph={graph} theme={theme} onSelectEventId={handleGraphSelect} />
          </div>
          <div className="shrink-0">
            <SummaryMetrics metrics={data.summary} />
          </div>
        </div>
      )}

      {!isLoading && activeNav === 'ai-interactions' && (
        <AiInteractionsView
          submissionId={data.candidate.submissionId}
          exchanges={data.aiExchanges}
          activeRevision={selectedRevision}
          onNewExchange={handleNewExchange}
          showToast={showToast}
        />
      )}

      {!isLoading && activeNav === 'test-results' && (
        <TestResultsView
          submissionId={data.candidate.submissionId}
          testRuns={data.testRuns}
          revisions={data.revisions}
          selectedRevision={selectedRevision}
          onNewTestRun={handleNewTestRun}
          showToast={showToast}
        />
      )}

      {!isLoading && activeNav === 'code-revisions' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <RevisionDiff
            revisions={data.revisions}
            selectedRevision={selectedRevision}
            onRevisionChange={setSelectedRevision}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            testRuns={data.testRuns}
            aiExchanges={data.aiExchanges}
            focusAnnotation={selectedEvidenceId !== null}
          />
        </div>
      )}

      {!isLoading && activeNav === 'reports' && (
        <ReportsView data={data} onExport={handleExport} />
      )}

      {!isLoading && activeNav === 'feedback' && (
        <FeedbackView data={data} />
      )}

      {/* Assessment Switcher Modal */}
      <AssessmentSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        assessments={assessmentsList}
        currentSubmissionId={data.candidate.submissionId}
        onSelect={handleSelectAssessment}
      />

      {/* Desktop Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notification */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="proof-fade-in fixed bottom-4 right-4 z-[60] flex max-w-[340px] items-start gap-2 rounded-card border border-line bg-surface px-3 py-2.5 shadow-pop"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
          <p className="text-[13px] font-medium leading-snug text-ink">{toast}</p>
        </div>
      ) : null}
    </AppLayout>
  );
}
