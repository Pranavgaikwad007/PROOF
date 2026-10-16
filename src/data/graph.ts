import type { GraphEdgeSpec, GraphNodeSpec } from '../types/assessment';

/*
 * Sample decision-graph topology for the prototype.
 *
 * Positions are absolute flow coordinates laid out as a compact 4-column
 * grid, every row reading left→right so the sequence stays natural:
 *
 *   Row 1:  Start → AI prompt → AI response → Code R1
 *   Row 2:  Failed test → Debug question → AI response → Code R2
 *   Row 3:  Passing test → Refactor → Final passing test → Submission
 *
 * The only non-horizontal links are the two row wraps (Code R1 → Failed test,
 * Code R2 → Passing test), which step through the gap between rows.
 *
 * Column step 172px, row step 100px, node width 156px.
 * This file is free of rendering concerns so it can later be replaced by
 * backend-provided graph data without touching the component.
 */
export const graphNodes: GraphNodeSpec[] = [
  {
    id: 'n-start',
    kind: 'start',
    label: 'Start',
    meta: '10:42:03',
    x: 0,
    y: 8,
    eventId: 'evt-001',
  },
  {
    id: 'n-prompt-1',
    kind: 'ai-prompt',
    label: 'AI prompt',
    meta: '10:47:18',
    x: 172,
    y: 8,
    eventId: 'evt-002',
  },
  {
    id: 'n-response-1',
    kind: 'ai-response',
    label: 'AI response',
    meta: '10:47:26',
    x: 344,
    y: 8,
    eventId: 'evt-003',
  },
  {
    id: 'n-code-r1',
    kind: 'code',
    label: 'Code revision R1',
    meta: '10:51:40',
    x: 516,
    y: 8,
    eventId: 'evt-004',
  },
  {
    id: 'n-test-fail',
    kind: 'test-fail',
    label: 'Failed test',
    meta: '1 failed / 3 passed',
    x: 0,
    y: 108,
    eventId: 'evt-005',
  },
  {
    id: 'n-question',
    kind: 'question',
    label: 'Debug question',
    meta: '10:56:05',
    x: 172,
    y: 108,
    eventId: 'evt-006',
  },
  {
    id: 'n-response-2',
    kind: 'ai-response',
    label: 'AI response',
    meta: '10:56:14',
    x: 344,
    y: 108,
    eventId: 'evt-007',
  },
  {
    id: 'n-code-r2',
    kind: 'code',
    label: 'Code revision R2',
    meta: '11:02:31',
    x: 516,
    y: 108,
    eventId: 'evt-008',
  },
  {
    id: 'n-test-pass',
    kind: 'test-pass',
    label: 'Passing test',
    meta: '4 passed',
    x: 0,
    y: 208,
    eventId: 'evt-009',
  },
  {
    id: 'n-refactor',
    kind: 'refactor',
    label: 'Refactor',
    meta: '11:09:47',
    x: 172,
    y: 208,
    eventId: 'evt-010',
  },
  {
    id: 'n-test-final',
    kind: 'test-pass',
    label: 'Final passing test',
    meta: '4 passed',
    x: 344,
    y: 208,
    eventId: 'evt-011',
  },
  {
    id: 'n-submit',
    kind: 'submission',
    label: 'Submission',
    meta: '11:10:48',
    x: 516,
    y: 208,
    eventId: 'evt-012',
  },
];

/*
 * Route per edge:
 *   forward — left→right within a row (source right handle → target left handle)
 *   down    — wrap into the gap below and continue on the next row
 *             (source bottom handle → target top handle)
 * Every row reads left→right, so only the two row wraps use `down`.
 */
export const graphEdges: GraphEdgeSpec[] = [
  { id: 'e-1', source: 'n-start', target: 'n-prompt-1', variant: 'default', route: 'forward' },
  { id: 'e-2', source: 'n-prompt-1', target: 'n-response-1', variant: 'default', route: 'forward' },
  { id: 'e-3', source: 'n-response-1', target: 'n-code-r1', variant: 'default', route: 'forward' },
  { id: 'e-4', source: 'n-code-r1', target: 'n-test-fail', variant: 'default', route: 'down' },
  {
    id: 'e-5',
    source: 'n-test-fail',
    target: 'n-question',
    variant: 'retry',
    route: 'forward',
  },
  { id: 'e-6', source: 'n-question', target: 'n-response-2', variant: 'default', route: 'forward' },
  { id: 'e-7', source: 'n-response-2', target: 'n-code-r2', variant: 'default', route: 'forward' },
  { id: 'e-8', source: 'n-code-r2', target: 'n-test-pass', variant: 'default', route: 'down' },
  { id: 'e-9', source: 'n-test-pass', target: 'n-refactor', variant: 'default', route: 'forward' },
  { id: 'e-10', source: 'n-refactor', target: 'n-test-final', variant: 'default', route: 'forward' },
  { id: 'e-11', source: 'n-test-final', target: 'n-submit', variant: 'default', route: 'forward' },
];
