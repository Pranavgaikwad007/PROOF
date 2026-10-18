# CHANGELOG-IA.md — Information Architecture & Screen Content Spec

This document details the architectural content restructuring applied to the PROOF frontend to establish strict, non-redundant boundaries across all five screens. Each feature and data point now resides in its single authoritative home.

---

## 1. Screen Architecture Summary & Relocations

| Screen | Authorized Content (Only Home) | Removed / Relocated Content | Deep-Link Outlets |
|---|---|---|---|
| **Overview** | • Mission Brief header<br>• Task Specification & Requirements<br>• 3 Policy cards (Criteria, AI Policy, Transparency)<br>• **Summary KPI strip** (its **only full home**)<br>• Full-width Primary Competency strip | • **DELETED**: Quick Workspace Navigation card (4 navigation tiles removed; navigation is handled exclusively by the sidebar). | `"Inspect in Evidence Inspector →"` (navigates to Evidence Inspector with primary finding and related code diff focused). |
| **BuildTrail** | • Chronological Event Timeline with Category Filters (Test, AI, Code)<br>• Compact Decision Graph flow strip<br>• Selected Event Detail card | • **REMOVED**: Full Code Revision Inspector (`<RevisionDiff>`) completely removed from this tab. | `"Inspect evidence →"` (deep-links into Evidence Inspector with that event, revision, and evidence tab focused). |
| **Evidence Inspector** | • **Findings Queue** (new compact list component)<br>• **Finding Details** (evidence count stated once: `SUPPORTING EVIDENCE · X items`)<br>• **Code Revision Inspector** (its **only home** across the entire app)<br>• **Collapsible full Decision Graph** (with Expand / Collapse toggle) | • **REMOVED**: Top KPI metrics strip (relocated exclusively to Overview).<br>• **REMOVED**: Event Timeline (`<BuildTrail>`) removed from this screen (belongs exclusively to BuildTrail). | Interactive evidence actions (`View Output`, `View Diff`, `View Interaction`) directly switch code revision tabs. |
| **Reports** | • Recruiter Report Header with Candidate Meta<br>• **Export Report (PDF)** (one-click vector PDF) + secondary `Export .md`<br>• **Evaluation Rubric Table** (5-row structured table with full 2-line names, weights, statuses, confidence, and scores)<br>• Findings as document text (observations with timeline citations, AI Contribution, Uncertainty & Boundary)<br>• Assessment Scope Limitations section<br>• Evidence Coverage summary & Recommended Technical Follow-up Questions<br>• Verified provenance footer | • **REMOVED**: Interactive code diff and metric tiles replaced by document format. | `"Inspect in Evidence Inspector →"` on finding header and per-evidence cards. |
| **Feedback** | • Personalized Performance Feedback header<br>• 2–3 Identified Engineering Strengths (clean titles, actionable feedback)<br>• 2–3 Recommended Practice & Next Steps (with difficulty badges: `Medium`, `Introductory`, `Best Practice`)<br>• **Plain Competency Snapshot** (no weights, no confidence scores, no internal `evt-ID` telemetry jargon) | • **REMOVED**: Evaluator scoring jargon, raw event IDs in titles (e.g., `(evt-006)`), and weights.<br>• **REMOVED**: All stale references to binary search, shifted arrays, pivot elements, and reactive UI. | Snapshot references session achievements aligned with the Python Task Manager. |

---

## 2. Detailed Screen Spec Implementation

### Screen 1: OVERVIEW (`src/components/views/OverviewView.tsx`)
- **Keeps ONLY**:
  1. Mission Brief header (`ASM-3088-TASK`, candidate metadata, role, status).
  2. Task Specification & Requirements (Python Task Manager specification, status filters, search empty-query behavior, filter state preservation).
  3. 3 Policy cards: Success Criteria, AI Collaboration Policy (Level 3 Verify), Recording & Transparency.
  4. Top KPI Summary Strip (`<SummaryMetrics />`): line 1 label (1–2 words), line 2 big 24px bold nowrap value, line 3 caption. **This is its only full home**.
  5. Full-width Primary Competency Strip: renders evaluated competency title (`Validation & Debugging`), status badge, confidence badge, observation summary, evidence item count, and an interactive deep-link button `"Inspect in Evidence Inspector →"`.
- **Deleted**:
  - Deleted the redundant `Quick Workspace Navigation` card containing 4 navigation buttons (BuildTrail, Evidence Inspector, Recruiter Report, Candidate Feedback). The sidebar already performs all workspace routing.

### Screen 2: BUILDTRAIL (`src/components/BuildTrail.tsx` & `src/App.tsx`)
- **Keeps ONLY**:
  1. Timeline events with Category Filter chips (Test, AI, Code, Clear Filters).
  2. Compact Decision Graph flow strip illustrating node sequence (`n1` through `n6`).
  3. Compact Event Detail card beneath the graph flow strip: shows event category icon, timestamp, revision badge, title, detailed telemetry description, event ID, sequence number, and competency linkage.
- **Removed**:
  - Code Revision Inspector (`<RevisionDiff>`) was completely excised from this tab. Diff and code inspection lives exclusively inside Evidence Inspector.
- **Deep-Link**:
  - Clicking `"Inspect evidence →"` on the selected event card transitions the application to `evidence-inspector`, selects that event ID, adjusts active revision (R1 or R2), and switches the active tab to the matching output, diff, or AI timeline.

### Screen 3: EVIDENCE INSPECTOR (`src/components/FindingsQueue.tsx`, `FindingDetails.tsx`, `RevisionDiff.tsx`, `App.tsx`)
- **Keeps ONLY**:
  1. **Findings Queue**: New dedicated `FindingsQueue.tsx` component rendering a compact, selectable queue of assessment findings (`Validation & Debugging`, `Problem Solving & Decomposition`, `AI Collaboration & Review`, `Code Understanding & Adaptability`). Clicking a finding switches the active finding in `FindingDetails` and selects its primary evidence.
  2. **Finding Details**: Displays verified status, confidence, evaluator observation, AI Contribution Analysis, Uncertainty Boundary, and supporting evidence cards. The evidence count is stated strictly once (`SUPPORTING EVIDENCE · X items`).
  3. **Code Revision Inspector**: The **only home** for `<RevisionDiff>`. Contains Evidence View (`task_manager.py`), Diff View (R1/R2 unified diff), Test Output (pytest ANSI run log), and AI Interaction Timeline (coach dialogue), along with the R1/R2 segmented switcher, Annotations accordion, and Focus Mode toggle.
  4. **Collapsible Full Decision Graph**: Rendered above Code Revision Inspector with a functional Collapse / Expand toggle button (`Collapse Graph` / `Expand Graph`), allowing users to minimize the graph flow strip to maximize vertical code editing space.
- **Removed**:
  - Removed `<SummaryMetrics />` (KPI strip) from this screen.
  - Removed `<BuildTrail />` (event timeline) from this screen, eliminating the duplicate timeline panel.

### Screen 4: REPORTS (`src/components/views/ReportsView.tsx`)
- **Keeps ONLY**:
  1. Report header with candidate metadata, role, assessment duration, and primary `"Export Report (PDF)"` button + secondary `"Export .md"` button.
  2. Evaluation Rubric Table: structured 5-row table (Functional Correctness, Problem Solving & Decomposition, Debugging & Validation, AI Collaboration & Review, Code Understanding & Adaptability) with full wrapped competency titles, weights, statuses, confidence ratings, and percentage scores.
  3. Findings as Document Text: formal finding observation referencing timeline events (`evt-004`, `evt-005`, `evt-006`, `evt-008`), AI Contribution Analysis callout, Uncertainty & Evidence Boundary callout, and supporting evidence chronology.
  4. Assessment Scope Limitations: 3-point boundary notice documenting the 18-minute session duration, observable telemetry bounds, and single-contributor scope.
  5. Evidence Coverage & Follow-up Questions: 100% telemetry linkage summary and 3 recommended technical interview questions for the hiring team.
  6. Provenance footer: `"Generated by PROOF Assessment Engine — evidence linked to session ASM-3088-TASK"`.
- **Deep-Links**:
  - Replaced interactive panels with `"Inspect in Evidence Inspector →"` action buttons on the finding header and on each chronology card.

### Screen 5: FEEDBACK (`src/components/views/FeedbackView.tsx`)
- **Keeps ONLY**:
  1. Personalized Performance Feedback header.
  2. 3 Identified Engineering Strengths:
     - *Targeted Edge-Case Diagnosis* (clean title, no raw `evt-006` jargon).
     - *Corrective Revision & State Preservation* (preservation of `self.active_filter`).
     - *Disciplined AI Verification* (adherence to Level 3 Verify guidance).
  3. 3 Practice Recommendations with difficulty tags:
     - *Empty-Input Semantics in Filter & Search APIs* (`Medium`)
     - *Defensive Input Validation (Empty Titles & Unknown IDs)* (`Introductory`)
     - *Test-First Edge-Case Coverage (Empty Query & Empty Catalogs)* (`Best Practice`)
  4. Plain Competency Snapshot: Written for the candidate in plain language without weights, confidence ratings, or internal telemetry event IDs.
- **Removed**:
  - Removed all mentions of: binary search, shifted arrays, pivot elements, dual-biasing helpers, loop termination invariants, and reactive UI.

---

## 3. Deep-Link & Cross-Screen Walkthrough Verification

Automated browser walkthrough executed via `puppeteer-core` with Google Chrome in headless mode:

```
Launching browser...
Navigating to http://localhost:5173...
--- Step 1: Checking Overview Screen ---
Overview checks: {
  hasMissionBrief: true,
  hasTaskSpec: true,
  hasSuccessCriteria: true,
  hasAiPolicy: true,
  hasRecording: true,
  hasKpi: true,
  hasPrimaryCompetency: true,
  hasDeletedQuickNav: true
}
Testing Overview -> Evidence Inspector deep link...
Landed on Evidence Inspector from Overview: true

--- Step 2: Checking BuildTrail Screen ---
BuildTrail checks: {
  hasTimeline: true,
  hasDecisionGraph: true,
  hasEventDetail: true,
  noCodeInspectorInBuildTrail: true
}
Testing BuildTrail Event Detail -> Evidence Inspector deep link...
Landed on Evidence Inspector from BuildTrail: true

--- Step 3: Checking Evidence Inspector Screen ---
Evidence Inspector checks: {
  hasFindingsQueue: true,
  hasFindingDetails: true,
  hasCodeInspector: true,
  hasCollapsibleGraph: true,
  noKpiInInspector: true
}
Testing Decision Graph collapse toggle...
Graph collapsed successfully: true

--- Step 4: Checking Reports Screen ---
Reports checks: {
  hasReportHeader: true,
  hasPdfExport: true,
  hasRubricTable: true,
  hasLimitations: true,
  hasCoverage: true,
  hasFollowUp: true,
  hasFooter: true
}
Testing Reports -> Evidence Inspector deep link...
Landed on Evidence Inspector from Report: true

--- Step 5: Checking Feedback Screen ---
Feedback checks: {
  hasFeedbackHeader: true,
  hasStrengths: true,
  hasRecommendations: true,
  hasSnapshot: true,
  noBinarySearch: true,
  noRawEvtIdsInFeedback: true
}
Console errors recorded: []
==================================================
SUCCESS: ALL 5 SCREENS AND DEEP LINKS VERIFIED OK!
==================================================
```

---

## 4. Confirmation of Zero Duplicated Panels

1. **Summary KPI Strip**: Resides **only** on Overview. Removed from Evidence Inspector.
2. **Event Timeline (`BuildTrail`)**: Resides **only** on BuildTrail. Removed from Evidence Inspector.
3. **Code Revision Inspector (`RevisionDiff`)**: Resides **only** on Evidence Inspector. Removed from BuildTrail.
4. **Findings Queue**: Resides **only** on Evidence Inspector.
5. **Quick Navigation Card**: Completely deleted. Sidebar handles all navigation.
6. **Console**: Zero errors during full walkthrough across all 5 screens.
