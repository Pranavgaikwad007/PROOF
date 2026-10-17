# FRONTEND_CONTRACT.md

## 1. Stack Summary

| Dimension | Value / Technology | Version (package.json) |
| :--- | :--- | :--- |
| **Framework** | React | `^18.3.1` (react, react-dom) |
| **Router** | None (No router installed; single root view at `/`) | N/A |
| **State Management** | React built-in local state (`useState`, `useRef`, `useMemo`, `useCallback`) + React Flow state (`useNodesState`, `useEdgesState`) | N/A |
| **Styling** | Tailwind CSS + PostCSS + Autoprefixer + Custom CSS variables (`src/index.css`) | `^3.4.17` (tailwindcss), `^8.5.1` (postcss), `^10.4.20` (autoprefixer) |
| **Build Tool** | Vite + `@vitejs/plugin-react` | `^6.0.11` (vite), `^4.3.4` (@vitejs/plugin-react) |
| **TypeScript** | TypeScript (Strict mode enabled) | `^5.7.3` (typescript) |
| **Graph / Flow Library** | `@xyflow/react` | `^12.4.4` |
| **Icons** | `lucide-react` | `^0.474.0` |
| **Code Editor** | None (No Monaco, CodeMirror, Ace; custom read-only diff renderer) | N/A |
| **Chart / Plotting** | None (Decision graph rendered via `@xyflow/react`) | N/A |
| **Terminal Library** | None (No xterm.js; static `<pre>` blocks) | N/A |

*Note on Architecture State:* The repository is an early-stage prototype focused entirely on the **Evidence Inspector** interface. There is no API client, no routing setup, no test execution runtime, and no state store outside component-local React hooks.

---

## 2. Screens Inventory

| Route / Path | Screen Name | Status | What is Rendered | User Actions Available |
| :--- | :--- | :--- | :--- | :--- |
| N/A | **Screen 1: Welcome & Mission Brief** | `MISSING` | Nothing rendered. No component or route exists. | None. |
| N/A | **Screen 2: Candidate Arena** | `MISSING` | Nothing rendered. No editor, coach, terminal, or runner exists. | None. |
| N/A (`buildtrail` nav item) | **Screen 3: BuildTrail (Dedicated)** | `PARTIAL` | Timeline component (`BuildTrail.tsx`) exists embedded inside the Evidence Inspector. Standalone full-screen route does not exist. | Category filtering dropdown, event row selection (dispatches event highlight to inspector). Nav item click triggers toast notice. |
| N/A (`reports` nav item) | **Screen 4: Recruiter Report (Dedicated)** | `PARTIAL` | Single finding summary card and metrics bar rendered within inspector. Client-side Markdown report generator exists in `src/lib/exportReport.ts`. Full one-page recruiter dashboard does not exist. | "Export Report" button downloads `proof-report-<id>.md`. Nav item click triggers toast notice. |
| N/A (`feedback` nav item) | **Screen 5: Candidate Feedback** | `MISSING` | Nothing rendered. No component or route exists. | Nav item click triggers toast notice: `""feedback" is not wired up in this prototype"`. |
| `/` (`evidence-inspector` nav item) | **Screen 6: Evidence Inspector** | `COMPLETE` *(Prototype)* | Three-column layout containing BuildTrail timeline, React Flow Decision Graph, multi-tab Revision Diff viewer (Evidence, Diff, Tests, AI timeline), Finding Details panel with linked evidence items, and Summary Metrics row. | - Switch active code revision (`R1` vs `R2`)<br>- Switch revision tabs (`Evidence View`, `Diff View`, `Test Output`, `AI Interaction Timeline`)<br>- Filter events by category (Navigation, AI prompt, AI response, Code, Test fail, Test pass, Question, Refactor, Submission)<br>- Click events in BuildTrail or nodes in DecisionGraph to cross-highlight code/tabs<br>- Click evidence items in FindingDetails to deep-link to code diffs / test logs<br>- Pan & zoom React Flow graph<br>- Toggle light/dark theme<br>- Export Markdown report<br>- Copy share URL to clipboard |

---

## 3. Component Map

```
App (src/App.tsx)
│  Responsibility: Root view coordinator managing revision selection, category filtering, tab switching, cross-panel highlighting, and toast alerts.
│
├── AppLayout (src/components/AppLayout.tsx)
│   │  Responsibility: Responsive master shell providing top navigation, desktop sidebar, mobile drawer overlay, and main content area.
│   ├── Sidebar (src/components/Sidebar.tsx)
│   │     Responsibility: Left rail showing brand logo, candidate identity & assessment summary, and 9 workspace navigation buttons.
│   └── TopBar (src/components/TopBar.tsx)
│         Responsibility: Top header displaying breadcrumbs, submission ID, theme toggle, export report, share button, and avatar.
│
├── BuildTrail (src/components/BuildTrail.tsx)
│     Responsibility: Filterable vertical event timeline rendering chronological actions with category badges and selection callbacks.
│
├── DecisionGraph (src/components/DecisionGraph.tsx)
│     Responsibility: Interactive directed node-edge graph (@xyflow/react) depicting candidate action flows and retry loops.
│
├── RevisionDiff (src/components/RevisionDiff.tsx)
│     Responsibility: Tabbed code inspection container rendering line-by-line annotated code, git-style unified diffs, pytest logs, and AI chats.
│
├── FindingDetails (src/components/FindingDetails.tsx)
│   │  Responsibility: Detailed competency evaluation card displaying observation text, confidence/impact ratings, AI contribution, uncertainty notes, and tags.
│   └── SupportingEvidence (src/components/SupportingEvidence.tsx)
│         Responsibility: Interactive list of linked evidence items with direct deep-linking action buttons.
│
├── SummaryMetrics (src/components/SummaryMetrics.tsx)
│     Responsibility: Five-card horizontal metric bar displaying test pass ratios, duration, evidence coverage, observations, and review status.
│
└── Panel / Badge / QuietButton (src/components/Panel.tsx)
      Responsibility: Foundational UI building blocks providing card containers, status badges, and subdued action buttons.
```

---

## 4. Data & API Contract

### Network Calls Audit

> **CURRENT NETWORK CALL STATUS: ZERO NETWORK CALLS.**  
> The frontend does not make any `fetch`, `axios`, `XMLHttpRequest`, or `WebSocket` calls. There are no API clients, MSW handlers, or mock service workers. All data is statically imported from hardcoded fixture files: `src/data/assessment.ts` and `src/data/graph.ts`.

The table below defines the exact HTTP endpoints the backend must implement to replace the hardcoded fixtures and fulfill the frontend contract:

| Method | Endpoint Path | Request Body | Response Shape | Status in Codebase |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments/:submissionId` | None | `AssessmentData` | `HARDCODED-FIXTURE` (statically imported in `src/App.tsx`) |
| `GET` | `/api/assessments/:submissionId/report` | None | Raw Markdown string or `AssessmentData` | `HARDCODED-FIXTURE` (built client-side in `src/lib/exportReport.ts`) |
| `GET` | `/api/assessments/:submissionId/share` | None | `{ url: string, submissionId: string }` | `MISSING` (client synthesizes `window.location.origin + '#submission/' + id`) |
| `GET` | `/api/assessments` | Query params: `{ page?: number, limit?: number }` | `{ items: CandidateInfo[], total: number }` | `MISSING` (Sidebar button "Back to Assessments" is disabled) |
| `POST` | `/api/candidates/assessments/:id/runs` | `{ revisionId: RevisionId, code: string }` | `TestRun` | `MISSING` (No candidate execution runtime exists) |
| `POST` | `/api/candidates/assessments/:id/ai-coach` | `{ prompt: string, contextRevisionId?: RevisionId }` | `AiExchange` | `MISSING` (No candidate AI coach interface exists) |

---

### Verbatim TypeScript Interfaces & Types

Below are the exact type declarations copied verbatim from [`src/types/assessment.ts`](file:///Users/sarthak/Desktop/Proof/src/types/assessment.ts):

```typescript
export type EventCategory =
  | 'navigation'
  | 'ai-prompt'
  | 'ai-response'
  | 'code'
  | 'test-fail'
  | 'test-pass'
  | 'question'
  | 'refactor'
  | 'submission';

export type RevisionId = 'R1' | 'R2';

export type EvidenceId = 'ev-failed-test' | 'ev-revision-r2' | 'ev-ai-exchange';

export type DiffLineKind = 'context' | 'add' | 'del';

export interface DiffLine {
  kind: DiffLineKind;
  oldNo: number | null;
  newNo: number | null;
  text: string;
}

export interface CodeAnnotation {
  line: number;
  tone: 'danger' | 'success' | 'info';
  text: string;
}

export interface CodeRevision {
  id: RevisionId;
  label: string;
  time: string;
  filename: string;
  language: string;
  summary: string;
  previous: RevisionId | null;
  additions: number;
  deletions: number;
  lines: DiffLine[];
  annotations: CodeAnnotation[];
  testResult: {
    passed: number;
    total: number;
    duration: string;
  };
}

export interface BuildEvent {
  id: string;
  seq: number;
  time: string;
  category: EventCategory;
  title: string;
  detail: string;
  ref: string;
  revision?: RevisionId;
  evidenceId?: EvidenceId;
}

export interface TestRun {
  id: string;
  label: string;
  time: string;
  revision: RevisionId;
  passed: boolean;
  summary: string;
  output: string;
}

export interface AiExchange {
  id: string;
  role: 'candidate' | 'ai';
  time: string;
  text: string;
  eventId: string;
  relatedRevision?: RevisionId;
}

export type EvidenceKind = 'test' | 'revision' | 'interaction';
export type EvidenceAction = 'output' | 'diff' | 'interaction';

export interface SupportingEvidenceItem {
  id: EvidenceId;
  kind: EvidenceKind;
  title: string;
  meta: string;
  detail: string;
  action: EvidenceAction;
  actionLabel: string;
  revision?: RevisionId;
  eventId: string;
}

export interface Finding {
  id: string;
  title: string;
  status: 'Demonstrated' | 'Partial' | 'Not observed';
  observation: string;
  confidence: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  sourceLinks: number;
  aiContribution: {
    label: string;
    text: string;
  };
  uncertainty: {
    label: string;
    text: string;
  };
  tags: string[];
  evidence: SupportingEvidenceItem[];
}

export interface GraphNodeSpec {
  id: string;
  kind: EventCategory | 'start';
  label: string;
  meta: string;
  x: number;
  y: number;
  eventId?: string;
}

/**
 * Which connection point an edge uses on its endpoints. Every row in the graph
 * reads left→right, so an edge is either a straight horizontal run or a wrap
 * that steps down into the gap between rows. Naming the handles keeps React
 * Flow from routing an edge back through the very nodes it connects.
 */
export type GraphEdgeRoute = 'forward' | 'down';

export interface GraphEdgeSpec {
  id: string;
  source: string;
  target: string;
  variant: 'default' | 'retry';
  label?: string;
  route?: GraphEdgeRoute;
}

export interface CandidateInfo {
  name: string;
  initials: string;
  role: string;
  status: string;
  startedAt: string;
  duration: string;
  assessment: string;
  problem: string;
  submissionId: string;
}

export type MetricTone = 'neutral' | 'success' | 'accent' | 'violet' | 'amber';

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  sub: string;
  tone: MetricTone;
}

export interface AssessmentData {
  candidate: CandidateInfo;
  events: BuildEvent[];
  revisions: CodeRevision[];
  testRuns: TestRun[];
  aiExchanges: AiExchange[];
  finding: Finding;
  graph: {
    nodes: GraphNodeSpec[];
    edges: GraphEdgeSpec[];
  };
  summary: SummaryMetric[];
}

export type DiffTab = 'evidence' | 'diff' | 'tests' | 'ai';
export type NavItemId =
  | 'overview'
  | 'buildtrail'
  | 'evidence-inspector'
  | 'decision-graph'
  | 'ai-interactions'
  | 'test-results'
  | 'code-revisions'
  | 'reports'
  | 'feedback';
```

Verbatim Theme & Storage Types from [`src/lib/theme.ts`](file:///Users/sarthak/Desktop/Proof/src/lib/theme.ts):

```typescript
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'proof-theme';
```

---

### Local Storage & Session Storage Keys

| Storage Type | Key Name | Data Type / Shape | Purpose |
| :--- | :--- | :--- | :--- |
| `localStorage` | `'proof-theme'` | `'light' \| 'dark'` | Persists the active UI color scheme across sessions. Read at bootstrap in `index.html` inline script and managed via `src/lib/theme.ts`. |
| `sessionStorage` | None | None | No session storage keys are accessed or set in the codebase. |

---

## 5. Event & Session Recording Hooks

| Recording Target | Code Location | What It Currently Captures | What Is Missing |
| :--- | :--- | :--- | :--- |
| **AI Prompts & Responses** | `src/data/assessment.ts` (`aiExchanges`), rendered in `RevisionDiff.tsx` (`AiTimeline`) | Static records with `id`, `role` (`candidate` vs `ai`), timestamp string, message text, linked `eventId`, and optional `relatedRevision`. | No streaming hooks, no socket listener, no token consumption metrics, no model version metadata, no prompt submission handler or input box. |
| **Code Edits & Diffs** | `src/data/assessment.ts` (`revisions`), rendered in `RevisionDiff.tsx` (`EvidenceView`, `DiffView`) | Static revisions (`R1`, `R2`) with addition/deletion counts, pre-computed line arrays (`kind`, `oldNo`, `newNo`, `text`), and line-level qualitative annotations (`line`, `tone`, `text`). | No keystroke logging, no IDE buffer change listener, no undo/redo history tracking, no automated git patch generator (diffs are hardcoded). |
| **Test Runs** | `src/data/assessment.ts` (`testRuns`), rendered in `RevisionDiff.tsx` (`TestOutput`) | Static test run entries with `id`, `label`, timestamp string, revision reference, `passed` boolean flag, summary string, and raw pytest console output text. | No test runner execution triggers, no exit code capture, no structured per-test status objects (duration, failure stack trace), no environment snapshot. |
| **User Explanations & Questions** | `src/data/assessment.ts` (`events` category `question`), rendered in `BuildTrail.tsx` | Event sequence number, timestamp, category flag, short title, and text detail. | No audio/video recording capture, no candidate thought/explanation input fields, no screen recording hooks. |
| **Session Disclosure / Consent** | `index.html`, `src/App.tsx` | Static disclaimer banner at bottom of page ("Evidence records observable actions..."). | No recording consent prompt, no microphone/camera permission hooks, no session telemetry or telemetry heartbeat. |

---

## 6. Code Execution & Tests

* **Editor Present:** **No code editor is installed or rendered.** There is no Monaco, CodeMirror, Ace, or editable `<textarea>`. All code views (`EvidenceView` and `DiffView` in `src/components/RevisionDiff.tsx`) are read-only `<div>` / `<span>` rows rendering pre-parsed diff line objects.
* **Preview / Iframe / Eval:** **None.** There is no `iframe`, web worker, JavaScript `eval()`, WebAssembly runtime, or sandboxed execution environment.
* **Test Runner UI:** **Display only.** The `TestOutput` component in `src/components/RevisionDiff.tsx` renders static pre-formatted strings of `pytest` console output within `<pre>` tags. There is no "Run Tests" action button, no progress bar, and no individual test status toggles.
* **Code Execution Reality:** **NOTHING EXECUTES CODE.** The application is completely static; candidate code cannot be executed, modified, or evaluated in the current codebase.

---

## 7. Environment & Config

* **Environment Variables:** **Zero referenced.** Neither `import.meta.env` nor `process.env` is called anywhere in the codebase.
* **Environment Files:** None present (`.env`, `.env.local`, `.env.production` do not exist).
* **Ports Used:**
  * Vite Dev Server: **`5173`** (configured explicitly in `vite.config.ts`: `server.port: 5173`, `server.open: false`).
* **CORS-Relevant Notes:**
  * No proxy is defined in `vite.config.ts`.
  * When a backend is introduced, either configure Vite's development proxy (`server.proxy` forwarding `/api` to the backend port) or configure CORS on the backend to allow origins `http://localhost:5173` and production deployment URLs.

---

## 8. Mocks, TODOs & Dead Ends

### Mock Data Files
* `src/data/assessment.ts` (406 lines): Contains hardcoded candidate profile for "Aarav Sharma" (`ASM-2041-TSSA`), 12 build events, 2 code revisions (`R1`, `R2`) with full line-by-line diff arrays, 3 pytest run outputs, 4 AI conversation exchanges, 1 finding object with 3 evidence items, and 5 summary metrics.
* `src/data/graph.ts` (157 lines): Contains hardcoded decision-graph topology with 12 nodes (`GraphNodeSpec`) and 11 edges (`GraphEdgeSpec`) with absolute pixel positions (`x`, `y`) designed for React Flow.

### Placeholder & Non-Functional Components
* **Sidebar Navigation Items:** Clicking 8 out of 9 navigation items (`overview`, `buildtrail`, `decision-graph`, `ai-interactions`, `test-results`, `code-revisions`, `reports`, `feedback`) triggers a toast notification stating that the screen is not wired up and keeps Evidence Inspector active.
* **Sidebar "Back to Assessments" Button:** Triggers a toast: `"Back to Assessments is disabled in the Step 1 prototype."`
* **TopBar Breadcrumbs:** Clickable links for "Assessments" and "Two Sum in Sorted Array" have no `onClick` handlers and perform no action.
* **TopBar "Share" Button:** Copies a fake URL hash (`#submission/ASM-2041-TSSA`) to the clipboard, but the application has no routing or hash listener to process it.
* **TopBar "Export Report" Button:** Generates and downloads a client-side Markdown file (`src/lib/exportReport.ts`) rather than fetching an authoritative report from a server.

### Code Comments & Dead Ends
* `src/App.tsx` (line 98): `showToast(`"${id}" is not wired up in this prototype — Evidence Inspector stays active.`);`
* `src/App.tsx` (line 105): `showToast('Back to Assessments is disabled in the Step 1 prototype.');`
* `src/App.tsx` (line 222): `All values shown are illustrative sample data for the prototype.`
* `src/lib/exportReport.ts` (line 77): `Generated by PROOF — Evidence-Driven AI Coding Assessment (sample prototype report).`
* `src/data/graph.ts` (line 4): `Sample decision-graph topology for the prototype.`
* *TODO / FIXME Comments:* Zero `TODO` or `FIXME` comments exist in the repository.

---

## 9. Gap Analysis vs PROOF Scope

| PROOF Requirement | Frontend State | File(s) Involved | Priority | Description & Gaps |
| :--- | :--- | :--- | :--- | :--- |
| **Screen 1: Welcome & Mission Brief** | `MISSING` | None | **P0** | Needs task briefing, success criteria checklist, AI usage policy declaration, and session recording disclosure/consent workflow. |
| **Screen 2: Candidate Arena** | `MISSING` | None | **P0** | Needs multi-file explorer, interactive code editor (Monaco/CodeMirror), live AI coach chat panel, test execution trigger/output, and terminal. |
| **Screen 4: Recruiter Report** | `PARTIAL` | `src/components/FindingDetails.tsx`, `src/components/SummaryMetrics.tsx`, `src/lib/exportReport.ts` | **P0** | Has finding card and markdown export, but lacks multi-skill summary view, candidate scorecards, rubric matrices, and human reviewer annotation inputs. |
| **Screen 6: Evidence Inspector** | `EXISTS` | `src/App.tsx`, `src/components/*` | **P0** | Rich interactive prototype exists with decision graph, diff views, and evidence linking, but currently relies entirely on static fixtures. |
| **Screen 3: BuildTrail (Dedicated)** | `PARTIAL` | `src/components/BuildTrail.tsx`, `src/components/DecisionGraph.tsx` | **P1** | Component exists in the inspector panel; needs a full-page view with multi-file scrubbers, commit comparisons, and test histories. |
| **Screen 5: Candidate Feedback** | `MISSING` | None | **P1** | Needs personalized candidate performance breakdown, identified strengths, code practice suggestions, and growth recommendations. |

---

## 10. Open Questions for the Backend

1. **Entity ID Conventions:**  
   The frontend models use specific ID formats: `submissionId` (`ASM-2041-TSSA`), event IDs (`evt-001`, `ref: 'evt_01HQ8K2M'`), revision IDs (`R1`, `R2`), evidence IDs (`ev-failed-test`), run IDs (`run-01`), exchange IDs (`ai-01`), node IDs (`n-start`), and edge IDs (`e-1`). Does the backend follow these string conventions or standard UUIDs?
2. **Finding Multiplicity:**  
   `AssessmentData.finding` is currently a single `Finding` object (`finding-03: Validation & Debugging`). In production, does an assessment have an array of findings (`findings: Finding[]`), and how does the UI select or paginate across them?
3. **Diff Generation & Storage:**  
   Does the backend return pre-calculated `DiffLine[]` structures (including `oldNo`, `newNo`, and `kind: 'context' | 'add' | 'del'`), or does it return standard git unified diff patches that the frontend must parse?
4. **Code Annotations Provenance:**  
   `CodeRevision.annotations` contain line numbers, tones (`danger` | `success` | `info`), and explanations. Are these generated asynchronously by backend AI evaluation models, or submitted by human recruiters?
5. **Decision Graph Layout Computation:**  
   `GraphNodeSpec` currently requires absolute coordinates (`x`, `y`), and `GraphEdgeSpec` requires explicit handle routing (`route: 'forward' | 'down'`). Will the backend compute node coordinates (e.g., via Dagre/Elk), or will the frontend compute layout dynamically from a raw node/edge adjacency list?
6. **Multi-File Architecture:**  
   `CodeRevision` only models a single file (`filename: 'solution.py'`). What is the backend schema for multi-file submissions and directory trees?
7. **Real-time Event Streaming:**  
   For the Candidate Arena (Screen 2) and live BuildTrail (Screen 3), will the backend support Server-Sent Events (SSE) or WebSockets for streaming AI coach replies and test runner terminal outputs?
8. **Authentication & Access Control:**  
   The frontend currently presents a candidate-facing profile with recruiter-facing evidence inspection tools in one view. What authentication mechanisms and role-based permissions (Candidate vs Recruiter/Evaluator) will govern access to these endpoints?

---

### Executive Summary

The codebase is a polished, static frontend prototype built with React 18, Vite, Tailwind CSS, and `@xyflow/react`, implementing **Screen 6: Evidence Inspector**. It features interactive event filtering, a decision flowchart, line-by-line diff views with annotations, test logs, and Markdown export. However, **100% of the data is hardcoded mock fixtures**; no network calls, API clients, or environment variables exist. **No complete candidate flow exists**: Screens 1 (Welcome), 2 (Candidate Arena), and 5 (Feedback) are entirely missing, and no code editor or execution engine is present.
