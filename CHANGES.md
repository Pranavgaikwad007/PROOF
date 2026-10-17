# CHANGES.md — Contract Extensions & Implementation Notes

This document records every place the backend implementation extended or adapted the specifications in [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md), along with the architectural rationale for each decision.

---

### 1. Extended Endpoints for Session Lifecycle
* **Contract Baseline:** [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md) Section 4 audited existing prototype fixtures and listed `/api/candidates/assessments/:id/runs` and `/api/candidates/assessments/:id/ai-coach` as `MISSING`.
* **Extension Added:** Implemented full RESTful session lifecycle routes:
  * `POST /api/sessions`: Initialize a new candidate assessment session with task, rubric, and recording consent.
  * `POST /api/sessions/:id/events`: Ingest atomic telemetry events (navigation, inquiry, prompt, code, test).
  * `POST /api/sessions/:id/revisions`: Save candidate code with server-side unified diff computation (`DiffLine[]`).
  * `POST /api/sessions/:id/runs`: Record test execution outputs and update revision test counters.
  * `POST /api/sessions/:id/end`: Conclude session, compute deterministic metrics, and generate report.
* **Reason:** Fulfills Requirement 3 ("Session Flow: one working lifecycle") so candidate actions persist into the database and dynamically assemble into the `AssessmentData` contract.

---

### 2. Dual-Mode AI Coach: Standard JSON and Server-Sent Events (SSE)
* **Contract Baseline:** [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md) Section 4 specifies `POST /api/candidates/assessments/:id/ai-coach` returning `AiExchange`.
* **Extension Added:** The endpoint supports both delivery modes:
  1. **Standard JSON:** If `Accept: application/json` is provided, returns the verbatim `AiExchange` object (`id`, `role`, `time`, `text`, `eventId`, `relatedRevision`).
  2. **SSE Streaming:** If `Accept: text/event-stream` or query parameter `?stream=true` is provided, streams `data: {"chunk": "..."}` events, concluding with `data: {"done": true, "exchange": <AiExchange>}`.
* **Reason:** Requirement 4 requires streaming responses over SSE for live chat UX while maintaining strict backward compatibility with the synchronous contract shape.

---

### 3. MetricTone Alignment in SummaryMetrics
* **Contract Baseline:** [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md) defines `export type MetricTone = 'neutral' | 'success' | 'accent' | 'violet' | 'amber';`.
* **Implementation Note:** Notice that `'danger'` is intentionally NOT part of the contract's `MetricTone` union type (unlike `BadgeProps`). When a test run has failures, the metric tone is set to `'amber'` (warning) rather than `'danger'` to prevent TypeScript compile errors on the frontend.
* **Reason:** Ensures strict conformance with the verbatim frontend type definition.

---

### 4. Authentication & Authorization Middleware
* **Contract Baseline:** [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md) Section 10 (Open Question #8) noted the absence of auth mechanisms.
* **Extension Added:**
  * Added `POST /api/auth/login` (verifies passwords via `bcryptjs` and signs JWTs).
  * Added `GET /api/auth/me` (returns authenticated user profile).
  * Supported quick demo tokens: `Bearer demo-recruiter-token` and `Bearer demo-candidate-token`, as well as `x-demo-role` header for frictionless automated testing.
  * Public endpoints: `GET /api/assessments/:submissionId` and report exports remain accessible without mandatory credentials to allow instant review of shared links.
* **Reason:** Fulfills Requirement 7 ("minimal but real auth: email+password bcrypt or demo-token login, JWT with role, role middleware").

---

### 5. SQLite Default Database with PostgreSQL Config
* **Contract Baseline:** Requirements asked for "PostgreSQL via Prisma ORM (provide a SQLite fallback config for demo resilience)".
* **Implementation Note:** Configured SQLite (`file:./dev.db`) as the default active datasource in `prisma/schema.prisma` and `.env.example`. PostgreSQL connection string templates are documented in `.env.example`.
* **Reason:** Guarantees that `npm install && npm run seed && npm run dev` works out of the box on any machine without requiring a live PostgreSQL instance or external database services.

---

### 6. Isolated Sandbox Stub Runner
* **Contract Baseline:** [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md) Section 6 confirmed "NOTHING EXECUTES CODE" in the frontend.
* **Extension Added:** Implemented `SafeStubRunner` adhering to the `ICodeRunner` interface. Untrusted candidate code is evaluated deterministically against task test suites (pytest style) without executing arbitrary code on the host server. Comprehensive architectural documentation and `TODO [DOCKER SANDBOX INTEGRATION]` comments detail the ephemeral container runner strategy.
* **Reason:** Strictly complies with security requirement: "NEVER execute candidate code in this API process".
