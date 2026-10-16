import type { AssessmentData, DiffLine } from '../types/assessment';
import { graphEdges, graphNodes } from './graph';

const r1Lines: DiffLine[] = [
  { kind: 'context', oldNo: 1, newNo: 1, text: 'from typing import List' },
  { kind: 'context', oldNo: 2, newNo: 2, text: '' },
  { kind: 'context', oldNo: 3, newNo: 3, text: '' },
  { kind: 'context', oldNo: 4, newNo: 4, text: 'def search_range(nums: List[int], target: int) -> List[int]:' },
  { kind: 'context', oldNo: 5, newNo: 5, text: '    left, right = 0, len(nums) - 1' },
  { kind: 'context', oldNo: 6, newNo: 6, text: '    first = -1' },
  { kind: 'context', oldNo: 7, newNo: 7, text: '    while left < right:' },
  { kind: 'context', oldNo: 8, newNo: 8, text: '        mid = (left + right) // 2' },
  { kind: 'context', oldNo: 9, newNo: 9, text: '        if nums[mid] == target:' },
  { kind: 'context', oldNo: 10, newNo: 10, text: '            first = mid' },
  { kind: 'context', oldNo: 11, newNo: 11, text: '            right = mid' },
  { kind: 'context', oldNo: 12, newNo: 12, text: '        elif nums[mid] < target:' },
  { kind: 'context', oldNo: 13, newNo: 13, text: '            left = mid + 1' },
  { kind: 'context', oldNo: 14, newNo: 14, text: '        else:' },
  { kind: 'context', oldNo: 15, newNo: 15, text: '            right = mid - 1' },
  { kind: 'context', oldNo: 16, newNo: 16, text: '    return [first, -1]' },
];

const r2Lines: DiffLine[] = [
  { kind: 'context', oldNo: 1, newNo: 1, text: 'from typing import List' },
  { kind: 'context', oldNo: 2, newNo: 2, text: '' },
  { kind: 'context', oldNo: 3, newNo: 3, text: '' },
  { kind: 'del', oldNo: 4, newNo: null, text: 'def search_range(nums: List[int], target: int) -> List[int]:' },
  { kind: 'del', oldNo: 5, newNo: null, text: '    left, right = 0, len(nums) - 1' },
  { kind: 'del', oldNo: 6, newNo: null, text: '    first = -1' },
  { kind: 'del', oldNo: 7, newNo: null, text: '    while left < right:' },
  { kind: 'del', oldNo: 8, newNo: null, text: '        mid = (left + right) // 2' },
  { kind: 'del', oldNo: 9, newNo: null, text: '        if nums[mid] == target:' },
  { kind: 'del', oldNo: 10, newNo: null, text: '            first = mid' },
  { kind: 'del', oldNo: 11, newNo: null, text: '            right = mid' },
  { kind: 'del', oldNo: 12, newNo: null, text: '        elif nums[mid] < target:' },
  { kind: 'del', oldNo: 13, newNo: null, text: '            left = mid + 1' },
  { kind: 'del', oldNo: 14, newNo: null, text: '        else:' },
  { kind: 'del', oldNo: 15, newNo: null, text: '            right = mid - 1' },
  { kind: 'del', oldNo: 16, newNo: null, text: '    return [first, -1]' },
  { kind: 'add', oldNo: null, newNo: 4, text: 'def search_range(nums: List[int], target: int) -> List[int]:' },
  { kind: 'add', oldNo: null, newNo: 5, text: '    return [find_bound(nums, target, True), find_bound(nums, target, False)]' },
  { kind: 'add', oldNo: null, newNo: 6, text: '' },
  { kind: 'add', oldNo: null, newNo: 7, text: '' },
  { kind: 'add', oldNo: null, newNo: 8, text: 'def find_bound(nums: List[int], target: int, find_first: bool) -> int:' },
  { kind: 'add', oldNo: null, newNo: 9, text: '    left, right = 0, len(nums) - 1' },
  { kind: 'add', oldNo: null, newNo: 10, text: '    result = -1' },
  { kind: 'add', oldNo: null, newNo: 11, text: '    while left <= right:' },
  { kind: 'add', oldNo: null, newNo: 12, text: '        mid = (left + right) // 2' },
  { kind: 'add', oldNo: null, newNo: 13, text: '        if nums[mid] == target:' },
  { kind: 'add', oldNo: null, newNo: 14, text: '            result = mid' },
  { kind: 'add', oldNo: null, newNo: 15, text: '            if find_first:' },
  { kind: 'add', oldNo: null, newNo: 16, text: '                right = mid - 1' },
  { kind: 'add', oldNo: null, newNo: 17, text: '            else:' },
  { kind: 'add', oldNo: null, newNo: 18, text: '                left = mid + 1' },
  { kind: 'add', oldNo: null, newNo: 19, text: '        elif nums[mid] < target:' },
  { kind: 'add', oldNo: null, newNo: 20, text: '            left = mid + 1' },
  { kind: 'add', oldNo: null, newNo: 21, text: '        else:' },
  { kind: 'add', oldNo: null, newNo: 22, text: '            right = mid - 1' },
  { kind: 'add', oldNo: null, newNo: 23, text: '    return result' },
];

export const assessment: AssessmentData = {
  candidate: {
    name: 'Aarav Sharma',
    initials: 'AS',
    role: 'Backend Engineering · L3',
    status: 'Completed',
    startedAt: '16 Oct 2026, 10:42 AM',
    duration: '01:28:47',
    assessment: 'Two Sum in Sorted Array',
    problem: 'Find the first and last index of a target in a sorted array.',
    submissionId: 'ASM-2041-TSSA',
  },
  events: [
    {
      id: 'evt-001',
      seq: 1,
      time: '10:42:03',
      category: 'navigation',
      title: 'Problem viewed',
      detail: 'Opened the problem statement and constraint notes.',
      ref: 'evt_01HQ8K2M',
    },
    {
      id: 'evt-002',
      seq: 2,
      time: '10:47:18',
      category: 'ai-prompt',
      title: 'AI prompt',
      detail: 'Asked for a binary-search approach to locate the first and last index of a target.',
      ref: 'evt_01HQ8K5P',
    },
    {
      id: 'evt-003',
      seq: 3,
      time: '10:47:26',
      category: 'ai-response',
      title: 'AI response',
      detail: 'Suggested a two-pass binary search using explicit bound helpers.',
      ref: 'evt_01HQ8K5R',
    },
    {
      id: 'evt-004',
      seq: 4,
      time: '10:51:40',
      category: 'code',
      title: 'Initial code revision',
      detail: 'Submitted R1: single-pass search that records only the first index.',
      ref: 'evt_01HQ8MD4',
      revision: 'R1',
    },
    {
      id: 'evt-005',
      seq: 5,
      time: '10:54:12',
      category: 'test-fail',
      title: 'Test run failed',
      detail: '1 of 4 tests failed — target at the upper bound returned [-1, -1].',
      ref: 'evt_01HQ8MP9',
      revision: 'R1',
      evidenceId: 'ev-failed-test',
    },
    {
      id: 'evt-006',
      seq: 6,
      time: '10:56:05',
      category: 'question',
      title: 'Candidate debugging question',
      detail: 'Asked why the loop terminates before the final element is evaluated.',
      ref: 'evt_01HQ8N2C',
      evidenceId: 'ev-ai-exchange',
    },
    {
      id: 'evt-007',
      seq: 7,
      time: '10:56:14',
      category: 'ai-response',
      title: 'AI response',
      detail: 'Explained the `left < right` termination condition and the missing second bound.',
      ref: 'evt_01HQ8N2F',
      evidenceId: 'ev-ai-exchange',
    },
    {
      id: 'evt-008',
      seq: 8,
      time: '11:02:31',
      category: 'code',
      title: 'Corrective code revision',
      detail: 'Submitted R2: `find_bound` helper covering both first and last occurrence.',
      ref: 'evt_01HQ8Q7X',
      revision: 'R2',
      evidenceId: 'ev-revision-r2',
    },
    {
      id: 'evt-009',
      seq: 9,
      time: '11:03:09',
      category: 'test-pass',
      title: 'Test run passed',
      detail: 'All 4 tests passed after the corrective revision.',
      ref: 'evt_01HQ8Q9B',
      revision: 'R2',
    },
    {
      id: 'evt-010',
      seq: 10,
      time: '11:09:47',
      category: 'refactor',
      title: 'Code refactor',
      detail: 'Renamed the helper flag to `find_first` and tightened the return path.',
      ref: 'evt_01HQ8S2K',
      revision: 'R2',
    },
    {
      id: 'evt-011',
      seq: 11,
      time: '11:10:22',
      category: 'test-pass',
      title: 'Final passing test run',
      detail: 'All 4 tests passed on the final revision.',
      ref: 'evt_01HQ8S5T',
      revision: 'R2',
    },
    {
      id: 'evt-012',
      seq: 12,
      time: '11:10:48',
      category: 'submission',
      title: 'Submission',
      detail: 'Candidate submitted the assessment for review.',
      ref: 'evt_01HQ8S7J',
    },
  ],
  revisions: [
    {
      id: 'R1',
      label: 'Initial code revision',
      time: '10:51:40',
      filename: 'solution.py',
      language: 'python',
      summary: 'Single binary-search pass that records only the first matching index.',
      previous: null,
      additions: 16,
      deletions: 0,
      testResult: { passed: 3, total: 4, duration: '0.04s' },
      annotations: [
        {
          line: 7,
          tone: 'danger',
          text: 'Loop guard `left < right` exits when both pointers meet, so the final index is never inspected.',
        },
        {
          line: 11,
          tone: 'danger',
          text: 'Only `first` is tracked and the loop always moves `right` leftward, so no last index is ever recorded.',
        },
        {
          line: 16,
          tone: 'danger',
          text: 'The second bound is hard-coded to `-1`, which fails the upper-bound test case.',
        },
      ],
      lines: r1Lines,
    },
    {
      id: 'R2',
      label: 'Corrective code revision',
      time: '11:02:31',
      filename: 'solution.py',
      language: 'python',
      summary: 'Two-pass search via a `find_bound` helper that returns either occurrence.',
      previous: 'R1',
      additions: 20,
      deletions: 13,
      testResult: { passed: 4, total: 4, duration: '0.03s' },
      annotations: [
        {
          line: 5,
          tone: 'success',
          text: 'Both bounds are now derived from a single helper, removing the hard-coded `-1`.',
        },
        {
          line: 11,
          tone: 'success',
          text: '`left <= right` keeps the loop alive until the pointers cross, covering the last element.',
        },
        {
          line: 16,
          tone: 'success',
          text: 'Biasing `right = mid - 1` locates the first occurrence; the inverse locates the last.',
        },
      ],
      lines: r2Lines,
    },
  ],
  testRuns: [
    {
      id: 'run-01',
      label: 'Run after R1',
      time: '10:54:12',
      revision: 'R1',
      passed: false,
      summary: '1 failed, 3 passed in 0.04s',
      output: `$ pytest -q tests/test_search_range.py
==================== test session starts =====================
collected 4 items

tests/test_search_range.py ...F
______________________ test_target_at_upper_bound ______________________
    def test_target_at_upper_bound():
>       assert search_range([1, 2, 3], 3) == [2, 2]
E       assert [-1, -1] == [2, 2]
E         Right contains one more item: 2
E         Full diff:
E           - [-1, -1]
E           + [2, 2]

tests/test_search_range.py:18: AssertionError
=================== short test summary info ====================
FAILED tests/test_search_range.py::test_target_at_upper_bound
================= 1 failed, 3 passed in 0.04s =================`,
    },
    {
      id: 'run-02',
      label: 'Run after R2',
      time: '11:03:09',
      revision: 'R2',
      passed: true,
      summary: '4 passed in 0.03s',
      output: `$ pytest -q tests/test_search_range.py
==================== test session starts =====================
collected 4 items

tests/test_search_range.py ....
==================== 4 passed in 0.03s =====================`,
    },
    {
      id: 'run-03',
      label: 'Final run',
      time: '11:10:22',
      revision: 'R2',
      passed: true,
      summary: '4 passed in 0.03s',
      output: `$ pytest -q tests/test_search_range.py
==================== test session starts =====================
collected 4 items

tests/test_search_range.py ....
==================== 4 passed in 0.03s =====================`,
    },
  ],
  aiExchanges: [
    {
      id: 'ai-01',
      role: 'candidate',
      time: '10:47:18',
      text: 'I need to return the first and last index of a target in a sorted array. Is binary search the right approach here, and how should I handle duplicates?',
      eventId: 'evt-002',
    },
    {
      id: 'ai-02',
      role: 'ai',
      time: '10:47:26',
      text: 'Binary search is appropriate for a sorted array. A common pattern is two passes: one biased toward the left bound and one toward the right bound, each returning an index or -1.',
      eventId: 'evt-003',
      relatedRevision: 'R1',
    },
    {
      id: 'ai-03',
      role: 'candidate',
      time: '10:56:05',
      text: 'My test run fails when the target is the last element — search_range([1, 2, 3], 3) returns [-1, -1] instead of [2, 2]. Why does my loop stop before checking it?',
      eventId: 'evt-006',
    },
    {
      id: 'ai-04',
      role: 'ai',
      time: '10:56:14',
      text: 'Your guard is `while left < right`, so the iteration ends when left and right are equal without evaluating that index. You also only track `first`, so the pair can never be complete. Run the search twice with a helper that accepts a flag, biasing `right = mid - 1` for the first occurrence and `left = mid + 1` for the last.',
      eventId: 'evt-007',
      relatedRevision: 'R2',
    },
  ],
  finding: {
    id: 'finding-03',
    title: 'Validation & Debugging',
    status: 'Demonstrated',
    observation:
      'After a failing test run the candidate inspected the failing assertion, asked a targeted question about the loop termination condition, and produced a revision that resolved the upper-bound case. All four tests passed on the follow-up run.',
    confidence: 'Medium',
    impact: 'High',
    sourceLinks: 3,
    aiContribution: {
      label: 'Possible Benefit',
      text: 'The AI response described the termination condition and the missing second bound. The candidate then restructured the function. The record shows the exchange and the subsequent revision, but not how much of the change was independently reasoned.',
    },
    uncertainty: {
      label: 'Medium uncertainty',
      text: 'Evidence covers observable actions and outputs only. It does not establish intent, private reasoning, or sole causation for the correction.',
    },
    tags: ['Debugging', 'Validation', 'Edge Case', 'Binary Search'],
    evidence: [
      {
        id: 'ev-failed-test',
        kind: 'test',
        title: 'Failed test run',
        meta: '10:54:12 · revision R1',
        detail: 'test_target_at_upper_bound — expected [2, 2], received [-1, -1].',
        action: 'output',
        actionLabel: 'View Output',
        revision: 'R1',
        eventId: 'evt-005',
      },
      {
        id: 'ev-revision-r2',
        kind: 'revision',
        title: 'Corrective code revision R2',
        meta: '11:02:31 · +20 −13',
        detail: 'Introduced `find_bound` helper with `while left <= right` and dual biasing.',
        action: 'diff',
        actionLabel: 'View Diff',
        revision: 'R2',
        eventId: 'evt-008',
      },
      {
        id: 'ev-ai-exchange',
        kind: 'interaction',
        title: 'Debugging exchange',
        meta: '10:56:05 – 10:56:14 · 2 messages',
        detail: 'Candidate asked why the loop ends before the final element; AI explained the guard condition.',
        action: 'interaction',
        actionLabel: 'View Interaction',
        eventId: 'evt-006',
      },
    ],
  },
  graph: { nodes: graphNodes, edges: graphEdges },
  summary: [
    { id: 'm-1', label: 'Objective Results', value: '4/4', sub: 'tests passed', tone: 'success' },
    { id: 'm-2', label: 'Performance', value: '01:28:47', sub: 'total duration', tone: 'neutral' },
    { id: 'm-3', label: 'Evidence Coverage', value: '90%', sub: 'events linked to findings', tone: 'accent' },
    { id: 'm-4', label: 'Observations', value: '6', sub: 'key findings', tone: 'violet' },
    { id: 'm-5', label: 'Review Status', value: 'Pending', sub: 'awaiting reviewer', tone: 'amber' },
  ],
};
