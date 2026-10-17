import type { GraphEdgeSpec, GraphNodeSpec } from '../types/assessment';

/*
 * Task Manager decision-graph topology.
 *
 * Positions are laid out as a spacious 4-column grid, every row reading left→right:
 *   Row 1:  Task briefing → AI prompt → AI response → Initial implementation R1
 *   Row 2:  Test run failed → Debugging inquiry → AI response → Corrective code revision R2
 *   Row 3:  Test run passed → Code refactor → Final test verification → Submission
 *
 * Column step 224px, row step 114px, node width 196px.
 */
export const graphNodes: GraphNodeSpec[] = [
  {
    id: 'n-start',
    kind: 'start',
    label: 'Task briefing viewed',
    meta: '14:15:02',
    x: 0,
    y: 8,
    eventId: 'evt-001',
  },
  {
    id: 'n-prompt-1',
    kind: 'ai-prompt',
    label: 'AI prompt',
    meta: '14:22:15',
    x: 224,
    y: 8,
    eventId: 'evt-002',
  },
  {
    id: 'n-response-1',
    kind: 'ai-response',
    label: 'AI response',
    meta: '14:22:24',
    x: 448,
    y: 8,
    eventId: 'evt-003',
  },
  {
    id: 'n-code-r1',
    kind: 'code',
    label: 'Initial implementation R1',
    meta: '14:35:10',
    x: 672,
    y: 8,
    eventId: 'evt-004',
  },
  {
    id: 'n-test-fail',
    kind: 'test-fail',
    label: 'Test run failed',
    meta: '1 failed / 4 passed',
    x: 0,
    y: 122,
    eventId: 'evt-005',
  },
  {
    id: 'n-question',
    kind: 'question',
    label: 'Debugging inquiry',
    meta: '14:41:00',
    x: 224,
    y: 122,
    eventId: 'evt-006',
  },
  {
    id: 'n-response-2',
    kind: 'ai-response',
    label: 'AI guidance response',
    meta: '14:41:10',
    x: 448,
    y: 122,
    eventId: 'evt-007',
  },
  {
    id: 'n-code-r2',
    kind: 'code',
    label: 'Corrective code revision R2',
    meta: '14:48:30',
    x: 672,
    y: 122,
    eventId: 'evt-008',
  },
  {
    id: 'n-test-pass',
    kind: 'test-pass',
    label: 'Test run passed',
    meta: '5 passed',
    x: 0,
    y: 236,
    eventId: 'evt-009',
  },
  {
    id: 'n-refactor',
    kind: 'refactor',
    label: 'Code refactor',
    meta: '14:55:00',
    x: 224,
    y: 236,
    eventId: 'evt-010',
  },
  {
    id: 'n-test-final',
    kind: 'test-pass',
    label: 'Final test verification',
    meta: '5 passed (0.05s)',
    x: 448,
    y: 236,
    eventId: 'evt-011',
  },
  {
    id: 'n-submit',
    kind: 'submission',
    label: 'Submission',
    meta: '14:56:00',
    x: 672,
    y: 236,
    eventId: 'evt-012',
  },
];

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
