# Endpoints.md — PROJECT PROOF API Specification

This document maps every endpoint implemented in the backend to its corresponding section in [FRONTEND_CONTRACT.md](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md), the frontend screen(s) it serves, and a verified `curl` example demonstrating exact response conformance.

---

## 1. Endpoints Mapping Table

| Method | Endpoint Path | Contract Section | Frontend Screen(s) Served | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments` | Section 4 (Row 4) | Screen 4: Recruiter Report / Sidebar navigation | Optional (Public or Candidate/Recruiter) | Returns paginated list of candidate assessments with metadata. |
| `GET` | `/api/assessments/:submissionId` | Section 4 (Row 1) | Screen 6: Evidence Inspector / Screen 3: BuildTrail | Optional | Returns complete `AssessmentData` entity verbatim matching frontend contract. |
| `GET` | `/api/assessments/:submissionId/report` | Section 4 (Row 2) | Screen 4: Recruiter Report / TopBar "Export Report" | Optional | Returns Markdown assessment report or JSON with markdown payload. |
| `GET` | `/api/assessments/:submissionId/share` | Section 4 (Row 3) | TopBar "Share" action button | Optional | Generates shareable URL hash for the assessment submission. |
| `POST` | `/api/candidates/assessments/:id/runs` | Section 4 (Row 5) | Screen 2: Candidate Arena / Test runner | Optional / Candidate | Executes candidate code via isolated sandbox runner stub; returns `TestRun`. |
| `POST` | `/api/candidates/assessments/:id/ai-coach` | Section 4 (Row 6) | Screen 2: Candidate Arena / AI Coach panel | Optional / Candidate | Queries AI Coach with policy-gated assistance levels; returns `AiExchange` or SSE stream. |
| `POST` | `/api/auth/login` | Contract Section 10 (Q8) | Screen 1: Welcome & Mission Brief / Auth modal | None | Authenticates candidate or recruiter using email+password or demo credentials. |
| `GET` | `/api/auth/me` | Contract Section 10 (Q8) | Global layout & TopBar user avatar | Bearer JWT / Demo token | Returns authenticated user profile. |
| `POST` | `/api/sessions` | Contract Section 10 & Flow | Screen 1: Welcome & Mission Brief (Disclosure accept) | Optional | Initializes an assessment session with task, rubric, and recording consent. |
| `POST` | `/api/sessions/:id/events` | Contract Section 5 & Flow | Screen 2 / 3: Candidate telemetry & BuildTrail | Optional | Ingests atomic timeline events (navigation, question, prompt, code, test). |
| `POST` | `/api/sessions/:id/revisions` | Contract Section 5 & Flow | Screen 2: Candidate Arena / Editor save | Optional | Saves code revisions and computes line-by-line unified diff against parent. |
| `POST` | `/api/sessions/:id/runs` | Contract Section 5 & Flow | Screen 2: Candidate Arena / Test runner | Optional | Records test execution logs and updates revision pass/fail counters. |
| `POST` | `/api/sessions/:id/end` | Contract Section 5 & Flow | Candidate submission action → Recruiter Report | Optional | Finalizes assessment session, triggers metric computation and report generation. |
| `GET` | `/api/health` | Infrastructure | Monitoring & Dev server verification | None | Returns backend status, environment, and current timestamp. |

---

## 2. Verified Curl Examples & Response Shapes

### 1. `GET /api/assessments`
* **Serves:** Screen 4 (Recruiter Overview / List)
* **Contract Reference:** Section 4, Row 4: `{ items: CandidateInfo[], total: number }`

```bash
curl -s http://localhost:4000/api/assessments?page=1&limit=2
```

**Verified Response:**
```json
{
  "items": [
    {
      "name": "Aarav Sharma",
      "initials": "AS",
      "role": "Backend Engineering · L3",
      "status": "Completed",
      "startedAt": "16 Oct 2026, 10:42 AM",
      "duration": "01:28:47",
      "assessment": "Two Sum in Sorted Array",
      "problem": "Find the first and last index of a target in a sorted array.",
      "submissionId": "ASM-2041-TSSA"
    }
  ],
  "total": 1
}
```

---

### 2. `GET /api/assessments/:submissionId`
* **Serves:** Screen 6 (Evidence Inspector) & Screen 3 (BuildTrail)
* **Contract Reference:** Section 4, Row 1: `AssessmentData` verbatim

```bash
curl -s http://localhost:4000/api/assessments/ASM-2041-TSSA
```

**Verified Response (Excerpt showing exact contract keys):**
```json
{
  "candidate": {
    "name": "Aarav Sharma",
    "initials": "AS",
    "role": "Backend Engineering · L3",
    "status": "Completed",
    "startedAt": "16 Oct 2026, 10:42 AM",
    "duration": "01:28:47",
    "assessment": "Two Sum in Sorted Array",
    "problem": "Find the first and last index of a target in a sorted array.",
    "submissionId": "ASM-2041-TSSA"
  },
  "events": [
    {
      "id": "cmvcjtr2l00019qdm54238711",
      "seq": 1,
      "time": "10:42:03",
      "category": "navigation",
      "title": "Problem viewed",
      "detail": "Opened the problem statement and constraint notes.",
      "ref": "evt_01HQ8K2M",
      "revision": null,
      "evidenceId": null
    }
  ],
  "revisions": [
    {
      "id": "R1",
      "label": "Initial code revision",
      "time": "10:51:40",
      "filename": "solution.py",
      "language": "python",
      "summary": "Single binary-search pass that records only the first matching index.",
      "previous": null,
      "additions": 16,
      "deletions": 0,
      "lines": [
        { "kind": "context", "oldNo": 1, "newNo": 1, "text": "from typing import List" }
      ],
      "annotations": [
        {
          "line": 7,
          "tone": "danger",
          "text": "Loop guard `left < right` exits when both pointers meet, so the final index is never inspected."
        }
      ],
      "testResult": {
        "passed": 3,
        "total": 4,
        "duration": "0.04s"
      }
    }
  ],
  "testRuns": [
    {
      "id": "run-01",
      "label": "Run after R1",
      "time": "10:54:12",
      "revision": "R1",
      "passed": false,
      "summary": "1 failed, 3 passed in 0.04s",
      "output": "$ pytest -q tests/test_search_range.py\n..."
    }
  ],
  "aiExchanges": [
    {
      "id": "ai-01",
      "role": "candidate",
      "time": "10:47:18",
      "text": "I need to return the first and last index of a target in a sorted array. Is binary search the right approach here, and how should I handle duplicates?",
      "eventId": "evt-002"
    }
  ],
  "finding": {
    "id": "finding-03",
    "title": "Validation & Debugging",
    "status": "Demonstrated",
    "observation": "After a failing test run (evt-005) the candidate inspected the failing assertion...",
    "confidence": "Medium",
    "impact": "High",
    "sourceLinks": 3,
    "aiContribution": {
      "label": "Possible Benefit",
      "text": "The AI response (evt-007) described the termination condition..."
    },
    "uncertainty": {
      "label": "Medium uncertainty",
      "text": "Evidence covers observable actions and outputs only. It does not establish intent, private reasoning, or sole causation for the correction."
    },
    "tags": ["Debugging", "Validation", "Edge Case", "Binary Search"],
    "evidence": [
      {
        "id": "ev-failed-test",
        "kind": "test",
        "title": "Failed test run",
        "meta": "10:54:12 · revision R1",
        "detail": "test_target_at_upper_bound — expected [2, 2], received [-1, -1].",
        "action": "output",
        "actionLabel": "View Output",
        "revision": "R1",
        "eventId": "evt-005"
      }
    ]
  },
  "graph": {
    "nodes": [
      {
        "id": "n-start",
        "kind": "start",
        "label": "Start",
        "meta": "10:42:03",
        "x": 0,
        "y": 8,
        "eventId": "evt-001"
      }
    ],
    "edges": [
      {
        "id": "e-1",
        "source": "n-start",
        "target": "n-prompt-1",
        "variant": "default",
        "route": "forward"
      }
    ]
  },
  "summary": [
    { "id": "m-1", "label": "Objective Results", "value": "4/4", "sub": "tests passed", "tone": "success" },
    { "id": "m-2", "label": "Performance", "value": "01:28:47", "sub": "total duration", "tone": "neutral" },
    { "id": "m-3", "label": "Evidence Coverage", "value": "82%", "sub": "events linked to findings", "tone": "accent" },
    { "id": "m-4", "label": "Observations", "value": "6", "sub": "key findings", "tone": "violet" },
    { "id": "m-5", "label": "Review Status", "value": "Pending", "sub": "awaiting reviewer", "tone": "amber" }
  ]
}
```

---

### 3. `GET /api/assessments/:submissionId/report`
* **Serves:** Screen 4 (Recruiter Report / TopBar "Export Report" download)
* **Contract Reference:** Section 4, Row 2: Markdown string or JSON report

```bash
curl -s http://localhost:4000/api/assessments/ASM-2041-TSSA/report -H "Accept: text/markdown"
```

**Verified Response:**
```markdown
# PROOF Assessment Report

**Submission:** ASM-2041-TSSA
**Candidate:** Aarav Sharma (Backend Engineering · L3)
**Assessment:** Two Sum in Sorted Array
**Status:** Completed
**Started:** 16 Oct 2026, 10:42 AM
**Duration:** 01:28:47

> Evidence records observable actions and outputs. It does not establish intent,
> private reasoning, or sole causation.

## Summary

| Metric | Value | Detail |
| --- | --- | --- |
| Objective Results | 4/4 | tests passed |
| Performance | 01:28:47 | total duration |
| Evidence Coverage | 82% | events linked to findings |
| Observations | 6 | key findings |
| Review Status | Pending | awaiting reviewer |

## Finding — Validation & Debugging
...
```

---

### 4. `GET /api/assessments/:submissionId/share`
* **Serves:** TopBar "Share" action button
* **Contract Reference:** Section 4, Row 3: `{ url: string, submissionId: string }`

```bash
curl -s http://localhost:4000/api/assessments/ASM-2041-TSSA/share
```

**Verified Response:**
```json
{
  "url": "http://localhost:4000/#submission/ASM-2041-TSSA",
  "submissionId": "ASM-2041-TSSA"
}
```

---

### 5. `POST /api/candidates/assessments/:id/runs`
* **Serves:** Screen 2 (Candidate Arena / Test runner execution)
* **Contract Reference:** Section 4, Row 5: `TestRun` verbatim

```bash
curl -s -X POST http://localhost:4000/api/candidates/assessments/ASM-2041-TSSA/runs \
  -H "Content-Type: application/json" \
  -d '{"revisionId": "R1", "code": "def search_range(nums, target):\n    return [-1, -1]"}'
```

**Verified Response:**
```json
{
  "id": "run-04",
  "label": "Run after R1",
  "time": "20:55:47",
  "revision": "R1",
  "passed": false,
  "summary": "3 passed, 1 failed in 0.04s",
  "output": "$ pytest -q tests/test_search_range.py\n==================== test session starts =====================\ncollected 4 items\n\ntests/test_search_range.py ...F\n______________________ test_target_at_upper_bound ______________________\n    def test_target_at_upper_bound():\n>       assert search_range([1, 2, 3], 3) == [2, 2]\nE       assert [-1, -1] == [2, 2]\nE         Right contains one more item: 2\nE         Full diff:\nE           - [-1, -1]\nE           + [2, 2]\n\ntests/test_search_range.py:18: AssertionError\n=================== short test summary info ====================\nFAILED tests/test_search_range.py::test_target_at_upper_bound\n================= 1 failed, 3 passed in 0.04s ================="
}
```

---

### 6. `POST /api/candidates/assessments/:id/ai-coach` (Standard & SSE Streaming)
* **Serves:** Screen 2 (Candidate Arena / AI Coach panel)
* **Contract Reference:** Section 4, Row 6: `AiExchange` verbatim

#### Standard JSON Response:
```bash
curl -s -X POST http://localhost:4000/api/candidates/assessments/ASM-2041-TSSA/ai-coach \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Why does my loop stop before checking the last element?", "contextRevisionId": "R1"}'
```

**Verified Response:**
```json
{
  "id": "ai-05",
  "role": "ai",
  "time": "20:55:57",
  "text": "Your guard is `while left < right`, so the iteration ends when left and right are equal without evaluating that index. You also only track `first`, so the pair can never be complete. Run the search twice with a helper that accepts a flag, biasing `right = mid - 1` for the first occurrence and `left = mid + 1` for the last.",
  "eventId": "cmvcjtr2n00099qdmdvevv4rv",
  "relatedRevision": "R1"
}
```

#### Server-Sent Events (SSE) Stream:
```bash
curl -N -X POST "http://localhost:4000/api/candidates/assessments/ASM-2041-TSSA/ai-coach?stream=true" \
  -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How should I structure the binary search algorithm?"}'
```

**Verified Stream:**
```
data: {"chunk":"Binary"}

data: {"chunk":" search"}

data: {"chunk":" is"}

data: {"chunk":" appropriate"}

data: {"done":true,"exchange":{"id":"ai-06","role":"ai","time":"20:56:05","text":"Binary search is appropriate...","eventId":"cmvcjtr2o000b9qdm12345678"}}
```

---

### 7. Authentication: `POST /api/auth/login` & `GET /api/auth/me`
* **Serves:** Screen 1 (Welcome & Mission Brief) & Recruiter authentication

```bash
# Login
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "recruiter@proof.dev", "password": "password123"}'
```

**Verified Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmvchbvcd0000uyrf2xw3m9ak",
    "email": "recruiter@proof.dev",
    "role": "recruiter",
    "name": "Elena Rostova",
    "initials": "ER"
  }
}
```

```bash
# Verify profile
curl -s http://localhost:4000/api/auth/me -H "Authorization: Bearer <TOKEN>"
```

**Verified Response:**
```json
{
  "user": {
    "id": "cmvchbvcd0000uyrf2xw3m9ak",
    "email": "recruiter@proof.dev",
    "role": "recruiter",
    "name": "Elena Rostova"
  }
}
```

---

### 8. Complete Session Lifecycle
* **Serves:** Candidate end-to-end flow (Start → Telemetry → Revision → Test → Report)

```bash
# Step 1: Start Session
curl -s -X POST http://localhost:4000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"taskTitle": "Task Manager", "recordingDisclosureAccepted": true, "aiPolicyLevel": 3}'

# Step 2: Ingest Telemetry Event
curl -s -X POST http://localhost:4000/api/sessions/<SESSION_ID>/events \
  -H "Content-Type: application/json" \
  -d '{"category": "question", "title": "Inquired on empty query", "detail": "Candidate inquired about empty query handling."}'

# Step 3: Save Code Revision
curl -s -X POST http://localhost:4000/api/sessions/<SESSION_ID>/revisions \
  -H "Content-Type: application/json" \
  -d '{"revisionId": "R1", "label": "Initial Code", "summary": "Initial draft", "code": "class TaskManager:\n    pass"}'

# Step 4: Record Test Run
curl -s -X POST http://localhost:4000/api/sessions/<SESSION_ID>/runs \
  -H "Content-Type: application/json" \
  -d '{"revisionId": "R1", "code": "class TaskManager:\n    pass", "passed": false, "summary": "1 failed, 4 passed", "output": "pytest log"}'

# Step 5: End Session & Generate Report
curl -s -X POST http://localhost:4000/api/sessions/<SESSION_ID>/end
```
