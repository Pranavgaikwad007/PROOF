# CHANGELOG-UI.md — PROOF Frontend UI Modernization

**Project:** PROOF — Evidence-Driven Assessment Platform  
**Target:** React Frontend (`http://localhost:5173`)  
**Scope:** Three-Phase Modernization (Normal Sizing, Unnecessary Item Removal, E2E Wiring & Consistency)  
**Constraints Preserved:** Zero changes to routes, data models, API contracts, or component business logic. Preserved dark navy sidebar and blue accent visual identity.

---

## 1. RESIZED (Design Tokens & Typography Applied)

Every screen was updated to modern web application density (Linear/GitHub/Notion standard) readable at 100% zoom without leaning in:

- **Root / Base Typography**:
  - `html, body`: Base font size elevated to **16px** (`src/index.css`), eliminating micro-dashboard density.
  - **Body Paragraphs & Finding Descriptions**: **15–16px**, line-height **1.5–1.6**, color `#1E293B` / `#0F172A`.
  - **List Rows, Event Titles, Nav Items, Buttons, Tabs**: Minimum **14px** (event titles: 14px semibold `#0F172A`).
  - **Labels, Chips, Timestamps**: **12–13px** (`text-[12px]` is the absolute floor across the entire app; no sub-12px text in status bars, gutters, or chips).
  - **Code Viewer & Diff**: **14px JetBrains Mono**, line-height **1.6** for high readability.
  - **KPI Numbers (Top Cards)**: **22–24px bold** (`text-[22px] sm:text-[24px] font-bold text-ink`); KPI labels **13px** (`text-[13px] font-medium text-muted`).
  - **Panel & Section Titles**: **15–16px semibold** (`text-[15px] sm:text-[16px] font-semibold text-ink`).

- **Sidebar Navigation**:
  - Row height: **40px** minimum (`min-h-[40px]`).
  - Navigation labels: **14px font size** (`text-[14px] font-medium`).
  - Icons: Sized to **18px** (`size={18}`).
  - Active indicator: Left accent bar (`border-l-[3px] border-accent`) with crisp contrast.

- **Decision Graph**:
  - Node dimensions: Expanded from cramped 168×40px to **196×56px** (`NODE_W = 196, NODE_H = 56`).
  - Node labels: **13px text** (`text-[13px]`), multi-line wrapped with `line-clamp-2` instead of truncation ("Inquired on empty query" renders completely with no ellipses).
  - Layout spacing: Expanded column pitch to `224px` and row pitch to `114px` (`src/data/graph.ts` and `backend/src/services/reportService.ts`).
  - Zoom controls: Minimum **32×32px** hit targets (`min-h-[32px] min-w-[32px]`).

- **Interactive Targets**:
  - Every interactive element (buttons, tabs, filter chips, pagination triggers): Minimum **32px** height.
  - Primary action buttons: Minimum **40px** height (`min-h-[40px] px-4`).

- **Breathing Room & Rhythm**:
  - Panel padding: Expanded to **20px** (`p-5 sm:p-6`).
  - Section gaps: Expanded to **20–24px** (`gap-5`, `space-y-5`).
  - List rows: Expanded to **10–12px** vertical padding (`py-2.5` to `py-3`).
  - Cramped 8px micro-dashboard spacing replaced with comfortable 12–20px spacing.

- **Responsive Viewport Density**:
  - **1366px (Standard Laptop)**: 2-column workspace with slide-over drawer for findings; zero horizontal page overflow.
  - **1920px (Desktop)**: Full 4-zone side-by-side workspace (Sidebar, BuildTrail, Center Graph + Code, Finding Details); zero horizontal page overflow.

---

## 2. REMOVED (Phase 2 Cleanup Items)

All items designated for removal in Phase 2 have been eliminated:

1. **[REMOVED] Raw Database IDs on BuildTrail Cards**:
   - BuildTrail cards previously rendered raw IDs (e.g., `cmcvjf4f000n9q988td542`).
   - Cards now display strictly: timestamp, category badge, revision chip, title, and one-line description.
   - Full event ID is restricted to hover tooltip (`title="Event ID: ..."` and the Evidence Inspector meta row).

2. **[REMOVED] Floating "+1 more metric (Review Status)" Chip**:
   - Overflow chip and modal popup removed.
   - Top KPI bar now cleanly renders all 5 primary metrics (Duration, Revisions, Tests Run, AI Queries, Integrity) in a single responsive grid row (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`).

3. **[REMOVED] Redundant Sidebar Entries**:
   - Sidebar previously contained 9 repetitive items (Decision Graph, AI Interactions, Test Results, and Code Revisions duplicated tabs in the Evidence Inspector).
   - Sidebar consolidated to exactly **5 items**:
     1. Overview
     2. BuildTrail
     3. Evidence Inspector
     4. Reports
     5. Feedback

4. **[REMOVED] Meaningless Count Badges on Sidebar Items**:
   - Arbitrary static number badges (1–9) beside nav labels have been removed from `Sidebar.tsx`.

5. **[REMOVED] Duplicate Revision Selectors**:
   - Removed secondary revision transition chip (`— → R1` / `< R1 >`) from the tab row in `RevisionDiff.tsx`.
   - Retained exactly one revision switcher (`R1` / `R2` segmented control) in the Code Revision Inspector header.

6. **[REMOVED] Giant Empty White Areas**:
   - Sized the code container to content with a sensible min-height (`min-h-[320px]`).
   - In Diff View for base revisions (R1), replaced blank space with a styled empty state card ("Base Revision — No Prior Diff: Select revision R2 to inspect incremental code changes").

7. **[REMOVED] Dead & Decorative Controls**:
   - Removed React Flow attribution branding watermark via `proOptions={{ hideAttribution: true }}` and `.react-flow__attribution { display: none !important; }`.
   - Verified active handlers for Focus Mode, Share link, Export Report, Keyboard Shortcuts (`?`), and Theme toggle (`T`).

8. **[REMOVED] Overlong Breadcrumbs**:
   - Strict format enforced in `TopBar.tsx`: `Assessments / [Task name] / [Screen]` (e.g. `Assessments / Task Manager / Evidence Inspector`).

---

## 3. FIXED (Phase 3 E2E Walkthrough & Consistency Fixes)

All wiring, linking, and data consistency issues resolved during the end-to-end audit:

1. **[FIXED] Content Consistency (Task Manager vs. Binary Search Mismatch)**:
   - *Problem:* Assessment header read "Task Manager" while the code panel rendered a binary-search `search_range` placeholder with "Binary Search" rubric tags.
   - *Fix:* Aligned seed database, fallback data, and report generation service to a single coherent Python `TaskManager` problem with tags `['Task Manager', 'Debugging', 'Validation', 'Edge Case', 'State Preservation']`.

2. **[FIXED] Realistic Assessment Session (Replaced 2-Line Placeholder)**:
   - *Problem:* Code was a 2-line placeholder `return [-1, -1]` that undermined demo credibility.
   - *Fix:* Built a complete realistic multi-revision lifecycle:
     - **R1**: Initial implementation with planted edge-case bug (empty query string `""` fails to return all active tasks).
     - **Test Run 1 (Failing)**: Pytest fails on `test_search_tasks_empty_query_returns_all` with `AssertionError: assert [] == 3 tasks`.
     - **AI Interaction**: Candidate asks AI coach how to handle empty search queries; AI coach advises returning all tasks while preserving filters.
     - **R2 (Fix)**: Candidate implements `if query == "": return list(self.tasks.values())` and preserves status filtering.
     - **Test Run 2 (Passing)**: Full pytest suite passes 4/4 tests.

3. **[FIXED] Broken Evidence Linking ("Insufficient Data" Error)**:
   - *Problem:* Primary finding reported "insufficient data" even though evidence existed in the BuildTrail, due to mismatched evidence IDs.
   - *Fix:* Linked finding evidence items directly to valid BuildTrail events (`evt-004`, `evt-006`, `evt-005`, `evt-008`). Primary finding status now correctly renders "Demonstrated" with complete supporting evidence.

4. **[FIXED] Decision Graph Label Truncation**:
   - *Problem:* Node labels were truncated with `truncate` ("Inquired on empt...").
   - *Fix:* Widened nodes to `196×56px`, replaced single-line truncation with `line-clamp-2`, and adjusted column layout pitch to `224px` to eliminate overlap.

5. **[FIXED] Evidence Action Routing & Drawer State**:
   - *Problem:* Clicking "View Output" or "View Diff" from within the finding drawer on laptops (< 1440px) left the drawer covering the screen, obscuring the newly activated tab.
   - *Fix:* `handleEvidenceSelect` in `src/App.tsx` now automatically sets `activeNav` to `'evidence-inspector'` and closes the drawer on viewports < 1440px so the user is immediately taken to the corresponding code/diff/test view.

6. **[FIXED] Assessment Switcher State Leakage**:
   - *Problem:* Switching assessments did not reset `selectedEvidenceId`, leading to stale evidence highlight on newly loaded assessments.
   - *Fix:* `fetchAssessment` now resets `selectedEvidenceId` to the first evidence item of the active assessment.
