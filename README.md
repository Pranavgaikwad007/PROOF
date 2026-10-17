# PROJECT PROOF — Evidence-Driven AI Coding Assessment Platform

PROJECT PROOF is an evidence-backed assessment platform where candidates complete real-world coding challenges with the assistance of a policy-gated AI coach. Every candidate action — navigation, queries, code edits, test iterations, and AI interactions — is captured as observable telemetry and synthesized into an evidence-grounded skill evaluation report.

---

## 1. Quickstart

### Running the Backend Service

The backend is built with Node.js, Express, TypeScript, and Prisma ORM (SQLite default for zero-setup demo resilience).

```bash
# Navigate to backend directory
cd backend

# 1. Install dependencies
npm install

# 2. Seed database (creates Task Manager assessment, users, and completed demo sessions)
npm run seed

# 3. Start development server (runs on port 4000)
npm run dev
```

*The backend health check is available at [http://localhost:4000/api/health](http://localhost:4000/api/health).*

---

## 2. Running Frontend + Backend Together

Follow this configuration to link the existing React + Vite frontend with the backend API:

### Port Allocation

| Component | Default Port | Protocol | Config Location |
| :--- | :--- | :--- | :--- |
| **Frontend (Vite)** | `5173` | HTTP | [`vite.config.ts`](file:///Users/sarthak/Desktop/Proof/vite.config.ts) (`server.port: 5173`) |
| **Backend (Express)** | `4000` | HTTP | [`backend/.env`](file:///Users/sarthak/Desktop/Proof/backend/.env) (`PORT=4000`) |

### CORS Configuration
The backend allows CORS requests from the frontend dev server origin:
```env
CORS_ORIGIN="http://localhost:5173"
```
*(Defined in [`backend/.env`](file:///Users/sarthak/Desktop/Proof/backend/.env))*.

### Where to Put the Frontend's `VITE_API_URL`
Create a `.env` file in the **project root** (next to `package.json` and `index.html`):

```bash
# In /Users/sarthak/Desktop/Proof/.env
VITE_API_URL=http://localhost:4000/api
```

Alternatively, configure Vite's development proxy in [`vite.config.ts`](file:///Users/sarthak/Desktop/Proof/vite.config.ts):

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

### Running Both Concurrently

You can run both processes from separate terminal windows:

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend (from project root)
npm run dev
```

Or from the root directory using the root package scripts:
```bash
npm run dev:backend   # Starts backend on :4000
npm run dev           # Starts Vite on :5173
```

---

## 3. Seeded Demo Accounts & Sessions

`npm run seed` automatically provisions the database with realistic data:

### Seed Users
* **Recruiter:** `recruiter@proof.dev` | Password: `password123`
* **Candidate:** `candidate@proof.dev` | Password: `password123`

### Demo Sessions Available Out-of-the-Box
1. **`ASM-2041-TSSA` (Two Sum in Sorted Array)**
   * Matches the exact 1:1 data fixture of the frontend Evidence Inspector prototype.
   * Direct URL: `http://localhost:4000/api/assessments/ASM-2041-TSSA`
2. **`ASM-3088-TASK` (Task Manager Assessment)**
   * Complete lifecycle containing candidate interaction with AI Coach, planted empty query bug on revision R1, failing test run, targeted debugging inquiry, corrective revision R2, and all tests passing.
   * Direct URL: `http://localhost:4000/api/assessments/ASM-3088-TASK`

---

## 4. Key Architectural Features

* **Strict Contract Conformance:** Every endpoint matches the exact JSON field names and types specified in [`FRONTEND_CONTRACT.md`](file:///Users/sarthak/Desktop/Proof/FRONTEND_CONTRACT.md).
* **Safe Sandbox Runner:** Untrusted candidate code is never executed in the API process. An isolated `ICodeRunner` stub simulates realistic pytest runs with full `TODO [DOCKER SANDBOX]` integration notes.
* **Dual-Mode AI Coach:** Supports both standard REST responses and Server-Sent Events (SSE) streaming (`?stream=true` or `Accept: text/event-stream`). Includes a built-in Mock Coach for 100% demo resilience when no `OPENAI_API_KEY` is present.
* **Deterministic Report Generation:** Pass/fail metrics, revision counts, and AI contribution distributions (`applied-as-is`, `applied-then-modified`, `candidate-authored`, `rejected`) are computed deterministically in TypeScript before narrative assembly.
* **Evidence Grounding:** All evaluation findings reference stored event IDs (`evt-005`, `evt-006`, etc.); missing evidence yields "Not observed" rather than hallucinations.

For detailed endpoint documentation, see [`Endpoints.md`](file:///Users/sarthak/Desktop/Proof/Endpoints.md).  
For implementation notes and contract extensions, see [`CHANGES.md`](file:///Users/sarthak/Desktop/Proof/CHANGES.md).
