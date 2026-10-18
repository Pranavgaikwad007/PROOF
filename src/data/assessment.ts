import type { AssessmentData, DiffLine } from '../types/assessment';
import { graphEdges, graphNodes } from './graph';

const r1Lines: DiffLine[] = [
  { kind: 'context', oldNo: 1, newNo: 1, text: 'class TaskManager:' },
  { kind: 'context', oldNo: 2, newNo: 2, text: '    def __init__(self):' },
  { kind: 'context', oldNo: 3, newNo: 3, text: '        self.tasks = {}' },
  { kind: 'context', oldNo: 4, newNo: 4, text: '        self.active_filter = None' },
  { kind: 'context', oldNo: 5, newNo: 5, text: '' },
  { kind: 'context', oldNo: 6, newNo: 6, text: '    def add_task(self, task_id: str, title: str, status: str = "todo", priority: str = "medium") -> dict:' },
  { kind: 'context', oldNo: 7, newNo: 7, text: '        if not title or not title.strip():' },
  { kind: 'context', oldNo: 8, newNo: 8, text: '            raise ValueError("Task title cannot be empty")' },
  { kind: 'context', oldNo: 9, newNo: 9, text: '        task = {"id": task_id, "title": title.strip(), "status": status, "priority": priority}' },
  { kind: 'context', oldNo: 10, newNo: 10, text: '        self.tasks[task_id] = task' },
  { kind: 'context', oldNo: 11, newNo: 11, text: '        return task' },
  { kind: 'context', oldNo: 12, newNo: 12, text: '' },
  { kind: 'context', oldNo: 13, newNo: 13, text: '    def complete_task(self, task_id: str) -> dict:' },
  { kind: 'context', oldNo: 14, newNo: 14, text: '        if task_id not in self.tasks:' },
  { kind: 'context', oldNo: 15, newNo: 15, text: '            raise KeyError(f"Task {task_id} not found")' },
  { kind: 'context', oldNo: 16, newNo: 16, text: '        self.tasks[task_id]["status"] = "completed"' },
  { kind: 'context', oldNo: 17, newNo: 17, text: '        return self.tasks[task_id]' },
  { kind: 'context', oldNo: 18, newNo: 18, text: '' },
  { kind: 'context', oldNo: 19, newNo: 19, text: '    def filter_by_status(self, status: str) -> list:' },
  { kind: 'context', oldNo: 20, newNo: 20, text: '        self.active_filter = status' },
  { kind: 'context', oldNo: 21, newNo: 21, text: '        return [t for t in self.tasks.values() if t["status"] == status]' },
  { kind: 'context', oldNo: 22, newNo: 22, text: '' },
  { kind: 'context', oldNo: 23, newNo: 23, text: '    def search(self, query: str) -> list:' },
  { kind: 'context', oldNo: 24, newNo: 24, text: '        # Planted edge-case bug: empty string returns empty list instead of full catalog' },
  { kind: 'context', oldNo: 25, newNo: 25, text: '        if not query:' },
  { kind: 'context', oldNo: 26, newNo: 26, text: '            return []' },
  { kind: 'context', oldNo: 27, newNo: 27, text: '        return [t for t in self.tasks.values() if query.lower() in t["title"].lower()]' },
];

const r2Lines: DiffLine[] = [
  { kind: 'context', oldNo: 1, newNo: 1, text: 'class TaskManager:' },
  { kind: 'context', oldNo: 2, newNo: 2, text: '    def __init__(self):' },
  { kind: 'context', oldNo: 3, newNo: 3, text: '        self.tasks = {}' },
  { kind: 'context', oldNo: 4, newNo: 4, text: '        self.active_filter = None' },
  { kind: 'context', oldNo: 5, newNo: 5, text: '' },
  { kind: 'context', oldNo: 6, newNo: 6, text: '    def add_task(self, task_id: str, title: str, status: str = "todo", priority: str = "medium") -> dict:' },
  { kind: 'context', oldNo: 7, newNo: 7, text: '        if not title or not title.strip():' },
  { kind: 'context', oldNo: 8, newNo: 8, text: '            raise ValueError("Task title cannot be empty")' },
  { kind: 'context', oldNo: 9, newNo: 9, text: '        task = {"id": task_id, "title": title.strip(), "status": status, "priority": priority}' },
  { kind: 'context', oldNo: 10, newNo: 10, text: '        self.tasks[task_id] = task' },
  { kind: 'context', oldNo: 11, newNo: 11, text: '        return task' },
  { kind: 'context', oldNo: 12, newNo: 12, text: '' },
  { kind: 'context', oldNo: 13, newNo: 13, text: '    def complete_task(self, task_id: str) -> dict:' },
  { kind: 'context', oldNo: 14, newNo: 14, text: '        if task_id not in self.tasks:' },
  { kind: 'context', oldNo: 15, newNo: 15, text: '            raise KeyError(f"Task {task_id} not found")' },
  { kind: 'context', oldNo: 16, newNo: 16, text: '        self.tasks[task_id]["status"] = "completed"' },
  { kind: 'context', oldNo: 17, newNo: 17, text: '        return self.tasks[task_id]' },
  { kind: 'context', oldNo: 18, newNo: 18, text: '' },
  { kind: 'context', oldNo: 19, newNo: 19, text: '    def filter_by_status(self, status: str) -> list:' },
  { kind: 'context', oldNo: 20, newNo: 20, text: '        self.active_filter = status' },
  { kind: 'context', oldNo: 21, newNo: 21, text: '        return [t for t in self.tasks.values() if t["status"] == status]' },
  { kind: 'context', oldNo: 22, newNo: 22, text: '' },
  { kind: 'context', oldNo: 23, newNo: 23, text: '    def search(self, query: str) -> list:' },
  { kind: 'del', oldNo: 24, newNo: null, text: '        # Planted edge-case bug: empty string returns empty list instead of full catalog' },
  { kind: 'del', oldNo: 25, newNo: null, text: '        if not query:' },
  { kind: 'del', oldNo: 26, newNo: null, text: '            return []' },
  { kind: 'add', oldNo: null, newNo: 24, text: '        # Corrected: empty or whitespace query returns all tasks in catalog' },
  { kind: 'add', oldNo: null, newNo: 25, text: '        if not query or not query.strip():' },
  { kind: 'add', oldNo: null, newNo: 26, text: '            return list(self.tasks.values())' },
  { kind: 'context', oldNo: 27, newNo: 27, text: '        return [t for t in self.tasks.values() if query.lower() in t["title"].lower()]' },
  { kind: 'add', oldNo: null, newNo: 28, text: '' },
  { kind: 'add', oldNo: null, newNo: 29, text: '    def update_task(self, task_id: str, **kwargs) -> dict:' },
  { kind: 'add', oldNo: null, newNo: 30, text: '        if task_id not in self.tasks:' },
  { kind: 'add', oldNo: null, newNo: 31, text: '            raise KeyError(f"Task {task_id} not found")' },
  { kind: 'add', oldNo: null, newNo: 32, text: '        self.tasks[task_id].update(kwargs)' },
  { kind: 'add', oldNo: null, newNo: 33, text: '        # Preserves active filter state across item updates' },
  { kind: 'add', oldNo: null, newNo: 34, text: '        return self.tasks[task_id]' },
];

export const assessment: AssessmentData = {
  candidate: {
    name: 'Aarav Sharma',
    initials: 'AS',
    role: 'Backend Engineering · L3',
    status: 'Completed',
    startedAt: '17 Oct 2026, 02:15 PM',
    duration: '01:12:30',
    assessment: 'Task Manager',
    problem:
      'Build a Task Manager in Python that manages task state with title, status, and priority.\nRequirements:\n1. List tasks with title, status, and priority.\n2. Add task and complete task by ID.\n3. Filter tasks by status (e.g. \'todo\', \'in_progress\', \'completed\').\n4. Search tasks by title (must handle empty query string by returning all tasks instead of empty list).\n5. Handle empty input and empty task list gracefully.\n6. Follow-up change request: preserve filter state on task updates.',
    submissionId: 'ASM-3088-TASK',
  },
  events: [
    {
      id: 'evt-001',
      seq: 1,
      time: '14:15:02',
      category: 'navigation',
      title: 'Task briefing viewed',
      detail: 'Candidate reviewed Task Manager specs and requirements.',
      ref: 'evt_TM_01',
    },
    {
      id: 'evt-002',
      seq: 2,
      time: '14:22:15',
      category: 'ai-prompt',
      title: 'AI prompt',
      detail: 'Inquired about maintaining active status filters across item updates.',
      ref: 'evt_TM_02',
    },
    {
      id: 'evt-003',
      seq: 3,
      time: '14:22:24',
      category: 'ai-response',
      title: 'AI response',
      detail: 'Advised storing current filter state as an instance attribute.',
      ref: 'evt_TM_03',
    },
    {
      id: 'evt-004',
      seq: 4,
      time: '14:35:10',
      category: 'code',
      title: 'Initial implementation R1',
      detail: 'Implemented TaskManager with add, complete, and search (planted empty query bug).',
      ref: 'evt_TM_04',
      revision: 'R1',
    },
    {
      id: 'evt-005',
      seq: 5,
      time: '14:37:45',
      category: 'test-fail',
      title: 'Test run failed',
      detail: '1 of 5 tests failed — test_search_empty_query_returns_all returned empty list.',
      ref: 'evt_TM_05',
      revision: 'R1',
      evidenceId: 'ev-failed-test',
    },
    {
      id: 'evt-006',
      seq: 6,
      time: '14:41:00',
      category: 'question',
      title: 'Debugging inquiry',
      detail: 'Asked why empty query filter returns 0 items instead of full collection.',
      ref: 'evt_TM_06',
      evidenceId: 'ev-ai-exchange',
    },
    {
      id: 'evt-007',
      seq: 7,
      time: '14:41:10',
      category: 'ai-response',
      title: 'AI response',
      detail: 'Explained convention: empty or whitespace search query should return all tasks.',
      ref: 'evt_TM_07',
      evidenceId: 'ev-ai-exchange',
    },
    {
      id: 'evt-008',
      seq: 8,
      time: '14:48:30',
      category: 'code',
      title: 'Corrective code revision R2',
      detail: 'Added empty query return and preserved filter state on task updates.',
      ref: 'evt_TM_08',
      revision: 'R2',
      evidenceId: 'ev-revision-r2',
    },
    {
      id: 'evt-009',
      seq: 9,
      time: '14:49:15',
      category: 'test-pass',
      title: 'Test run passed',
      detail: 'All 5 test cases passed successfully.',
      ref: 'evt_TM_09',
      revision: 'R2',
    },
    {
      id: 'evt-010',
      seq: 10,
      time: '14:55:00',
      category: 'refactor',
      title: 'Code refactor',
      detail: 'Optimized task dictionary lookups and sanitized status validation.',
      ref: 'evt_TM_10',
      revision: 'R2',
    },
    {
      id: 'evt-011',
      seq: 11,
      time: '14:55:40',
      category: 'test-pass',
      title: 'Final test verification',
      detail: '5 of 5 tests passing in 0.05s.',
      ref: 'evt_TM_11',
      revision: 'R2',
    },
    {
      id: 'evt-012',
      seq: 12,
      time: '14:56:00',
      category: 'submission',
      title: 'Submission',
      detail: 'Assessment completed and submitted for evaluation.',
      ref: 'evt_TM_12',
    },
  ],
  revisions: [
    {
      id: 'R1',
      label: 'Initial implementation R1',
      time: '14:35:10',
      filename: 'task_manager.py',
      language: 'python',
      summary: 'Task manager with add, complete, and search functions (planted empty query bug).',
      previous: null,
      additions: 27,
      deletions: 0,
      lines: r1Lines,
      annotations: [
        {
          line: 25,
          tone: 'danger',
          text: 'Empty query guard returns [] instead of the full task catalog.',
        },
      ],
      testResult: {
        passed: 4,
        total: 5,
        duration: '0.06s',
      },
    },
    {
      id: 'R2',
      label: 'Corrective code revision R2',
      time: '14:48:30',
      filename: 'task_manager.py',
      language: 'python',
      summary: 'Fixed empty query search handling and preserved filters on update.',
      previous: 'R1',
      additions: 7,
      deletions: 3,
      lines: r2Lines,
      annotations: [
        {
          line: 25,
          tone: 'success',
          text: 'Empty or whitespace query correctly returns all catalog tasks as expected.',
        },
        {
          line: 33,
          tone: 'success',
          text: 'Preserves active filter state across item updates.',
        },
      ],
      testResult: {
        passed: 5,
        total: 5,
        duration: '0.05s',
      },
    },
  ],
  testRuns: [
    {
      id: 'run-01',
      label: 'Run after R1',
      time: '14:37:45',
      revision: 'R1',
      passed: false,
      summary: '1 failed, 4 passed in 0.06s',
      output: `$ pytest -q tests/test_task_manager.py
==================== test session starts =====================
collected 5 items

tests/test_task_manager.py ....F
______________________ test_search_empty_query_returns_all ______________________
    def test_search_empty_query_returns_all():
        tm = TaskManager()
        tm.add_task("1", "Deploy microservice")
        tm.add_task("2", "Write documentation")
        tm.add_task("3", "Implement health check")
>       assert len(tm.search("")) == 3
E       AssertionError: assert 0 == 3
E         where 0 = len([])

tests/test_task_manager.py:28: AssertionError
=================== short test summary info ====================
FAILED tests/test_task_manager.py::test_search_empty_query_returns_all
================= 1 failed, 4 passed in 0.06s =================`,
    },
    {
      id: 'run-02',
      label: 'Run after R2',
      time: '14:49:15',
      revision: 'R2',
      passed: true,
      summary: '5 passed in 0.05s',
      output: `$ pytest -q tests/test_task_manager.py
==================== test session starts =====================
collected 5 items

tests/test_task_manager.py .....
==================== 5 passed in 0.05s =====================`,
    },
    {
      id: 'run-03',
      label: 'Final verification',
      time: '14:55:40',
      revision: 'R2',
      passed: true,
      summary: '5 passed in 0.05s',
      output: `$ pytest -q tests/test_task_manager.py
==================== test session starts =====================
collected 5 items

tests/test_task_manager.py .....
==================== 5 passed in 0.05s =====================`,
    },
  ],
  aiExchanges: [
    {
      id: 'ai-01',
      role: 'candidate',
      time: '14:41:00',
      text: 'My search test is failing on empty query `""`. It returns 0 items instead of the full list. What is the expected behavior for an empty search query?',
      eventId: 'evt-006',
    },
    {
      id: 'ai-02',
      role: 'ai',
      time: '14:41:10',
      text: 'In standard search UX, an empty or whitespace query indicates no active search filter, so it should return all items in the current collection rather than an empty list. Update your check to return `list(self.tasks.values())` when `not query or not query.strip()`.',
      eventId: 'evt-007',
      relatedRevision: 'R2',
    },
  ],
  finding: {
    id: 'finding-03',
    title: 'Validation & Debugging',
    status: 'Demonstrated',
    observation:
      'After a failing test run (evt-005 on empty query handling) the candidate inspected the failing assertion, asked a targeted inquiry to the AI coach about empty query semantics (evt-006), and produced a corrective revision (evt-008, R2) that resolved the catalog return. All 5 test cases passed on the follow-up run.',
    confidence: 'High',
    impact: 'High',
    sourceLinks: 3,
    aiContribution: {
      label: 'Targeted Guidance',
      text: 'The AI response (evt-007) confirmed the UX convention that empty or whitespace queries should return all tasks. The candidate independently integrated this into task_manager.py with proper whitespace stripping.',
    },
    uncertainty: {
      label: 'Low uncertainty',
      text: 'Telemetry exhibits a clear, reproducible cause-and-effect progression from failing test assertion to inquiry, code correction, and passing test verification.',
    },
    tags: ['Task Manager', 'Debugging', 'Validation', 'Edge Case', 'State Preservation'],
    evidence: [
      {
        id: 'ev-failed-test',
        kind: 'test',
        title: 'Failed test run',
        meta: '14:37:45 · revision R1',
        detail: '1 of 5 tests failed — test_search_empty_query_returns_all returned empty list.',
        action: 'output',
        actionLabel: 'View Output',
        revision: 'R1',
        eventId: 'evt-005',
      },
      {
        id: 'ev-revision-r2',
        kind: 'revision',
        title: 'Corrective code revision R2',
        meta: '14:48:30 · +7 −3',
        detail: 'Added empty/whitespace query return and preserved filter state on update.',
        action: 'diff',
        actionLabel: 'View Diff',
        revision: 'R2',
        eventId: 'evt-008',
      },
      {
        id: 'ev-ai-exchange',
        kind: 'interaction',
        title: 'Debugging exchange',
        meta: '14:41:00 · 2 messages',
        detail: 'Inquiry and AI guidance on empty search query semantics.',
        action: 'interaction',
        actionLabel: 'View Interaction',
        eventId: 'evt-006',
      },
    ],
  },
  graph: {
    nodes: graphNodes,
    edges: graphEdges,
  },
  summary: [
    { id: 'm-1', label: 'Tests', value: '5/5', sub: '5/5 passed', tone: 'success' },
    { id: 'm-2', label: 'Duration', value: '01:12:30', sub: 'total duration', tone: 'neutral' },
    { id: 'm-3', label: 'Coverage', value: '82%', sub: 'linked to findings', tone: 'neutral' },
    { id: 'm-4', label: 'Findings', value: '6', sub: 'key findings', tone: 'neutral' },
    { id: 'm-5', label: 'Review', value: 'Passed', sub: 'evaluated & confirmed', tone: 'success' },
  ],
};
