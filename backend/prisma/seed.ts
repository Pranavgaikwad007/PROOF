import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PROOF database seed...');

  // Clean existing records
  await prisma.report.deleteMany();
  await prisma.evidenceItem.deleteMany();
  await prisma.skillResult.deleteMany();
  await prisma.aiExchangeRecord.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.codeRevision.deleteMany();
  await prisma.sessionEvent.deleteMany();
  await prisma.session.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@proof.dev',
      passwordHash,
      role: 'recruiter',
      name: 'Elena Rostova',
      initials: 'ER',
    },
  });

  const candidate = await prisma.user.create({
    data: {
      email: 'candidate@proof.dev',
      passwordHash,
      role: 'candidate',
      name: 'Aarav Sharma',
      initials: 'AS',
    },
  });

  console.log('✅ Created users: recruiter@proof.dev, candidate@proof.dev');

  // 2. Create Assessment: Task Manager
  const taskManagerAssessment = await prisma.assessment.create({
    data: {
      title: 'Task Manager',
      role: 'Backend Engineering · L3',
      problem: `Build a Task Manager in Python that manages task state with title, status, and priority.
Requirements:
1. List tasks with title, status, and priority.
2. Add task and complete task by ID.
3. Filter tasks by status (e.g. 'todo', 'in_progress', 'completed').
4. Search tasks by title (must handle empty query string by returning all tasks instead of empty list).
5. Handle empty input and empty task list gracefully.
6. Follow-up change request: preserve filter state on task updates.`,
      starterFilename: 'task_manager.py',
      language: 'python',
      timeLimit: '01:30:00',
      aiPolicy: 3,
      rubricJson: JSON.stringify({
        functionalCorrectness: 30,
        problemSolving: 20,
        debuggingValidation: 20,
        aiCollaboration: 15,
        codeUnderstanding: 15,
      }),
    },
  });

  // 3. Create Assessment: Two Sum in Sorted Array (matches frontend prototype)
  const twoSumAssessment = await prisma.assessment.create({
    data: {
      title: 'Two Sum in Sorted Array',
      role: 'Backend Engineering · L3',
      problem: 'Find the first and last index of a target in a sorted array.',
      starterFilename: 'solution.py',
      language: 'python',
      timeLimit: '01:30:00',
      aiPolicy: 3,
      rubricJson: JSON.stringify({
        functionalCorrectness: 30,
        problemSolving: 20,
        debuggingValidation: 20,
        aiCollaboration: 15,
        codeUnderstanding: 15,
      }),
    },
  });

  console.log('✅ Created assessments: Task Manager, Two Sum in Sorted Array');

  // 4. Create Session: ASM-2041-TSSA (matches FRONTEND_CONTRACT.md 1:1)
  const twoSumSession = await prisma.session.create({
    data: {
      submissionId: 'ASM-2041-TSSA',
      assessmentId: twoSumAssessment.id,
      candidateId: candidate.id,
      status: 'Completed',
      startedAt: '16 Oct 2026, 10:42 AM',
      duration: '01:28:47',
      recordingDisclosureAccepted: true,
      aiPolicyLevel: 3,
    },
  });

  // Seed events for ASM-2041-TSSA
  const twoSumEvents = [
    {
      seq: 1,
      timestamp: '10:42:03',
      category: 'navigation',
      title: 'Problem viewed',
      detail: 'Opened the problem statement and constraint notes.',
      ref: 'evt_01HQ8K2M',
    },
    {
      seq: 2,
      timestamp: '10:47:18',
      category: 'ai-prompt',
      title: 'AI prompt',
      detail: 'Asked for a binary-search approach to locate the first and last index of a target.',
      ref: 'evt_01HQ8K5P',
    },
    {
      seq: 3,
      timestamp: '10:47:26',
      category: 'ai-response',
      title: 'AI response',
      detail: 'Suggested a two-pass binary search using explicit bound helpers.',
      ref: 'evt_01HQ8K5R',
    },
    {
      seq: 4,
      timestamp: '10:51:40',
      category: 'code',
      title: 'Initial code revision',
      detail: 'Submitted R1: single-pass search that records only the first index.',
      ref: 'evt_01HQ8MD4',
      revisionId: 'R1',
    },
    {
      seq: 5,
      timestamp: '10:54:12',
      category: 'test-fail',
      title: 'Test run failed',
      detail: '1 of 4 tests failed — target at the upper bound returned [-1, -1].',
      ref: 'evt_01HQ8MP9',
      revisionId: 'R1',
      evidenceId: 'ev-failed-test',
    },
    {
      seq: 6,
      timestamp: '10:56:05',
      category: 'question',
      title: 'Candidate debugging question',
      detail: 'Asked why the loop terminates before the final element is evaluated.',
      ref: 'evt_01HQ8N2C',
      evidenceId: 'ev-ai-exchange',
    },
    {
      seq: 7,
      timestamp: '10:56:14',
      category: 'ai-response',
      title: 'AI response',
      detail: 'Explained the `left < right` termination condition and the missing second bound.',
      ref: 'evt_01HQ8N2F',
      evidenceId: 'ev-ai-exchange',
    },
    {
      seq: 8,
      timestamp: '11:02:31',
      category: 'code',
      title: 'Corrective code revision',
      detail: 'Submitted R2: `find_bound` helper covering both first and last occurrence.',
      ref: 'evt_01HQ8Q7X',
      revisionId: 'R2',
      evidenceId: 'ev-revision-r2',
    },
    {
      seq: 9,
      timestamp: '11:03:09',
      category: 'test-pass',
      title: 'Test run passed',
      detail: 'All 4 tests passed after the corrective revision.',
      ref: 'evt_01HQ8Q9B',
      revisionId: 'R2',
    },
    {
      seq: 10,
      timestamp: '11:09:47',
      category: 'refactor',
      title: 'Code refactor',
      detail: 'Renamed the helper flag to `find_first` and tightened the return path.',
      ref: 'evt_01HQ8S2K',
      revisionId: 'R2',
    },
    {
      seq: 11,
      timestamp: '11:10:22',
      category: 'test-pass',
      title: 'Final passing test run',
      detail: 'All 4 tests passed on the final revision.',
      ref: 'evt_01HQ8S5T',
      revisionId: 'R2',
    },
    {
      seq: 12,
      timestamp: '11:10:48',
      category: 'submission',
      title: 'Submission',
      detail: 'Candidate submitted the assessment for review.',
      ref: 'evt_01HQ8S7J',
    },
  ];

  for (const evt of twoSumEvents) {
    await prisma.sessionEvent.create({
      data: {
        sessionId: twoSumSession.id,
        ...evt,
      },
    });
  }

  // Seed Revisions for ASM-2041-TSSA
  const r1Lines = [
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

  const r2Lines = [
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

  await prisma.codeRevision.create({
    data: {
      sessionId: twoSumSession.id,
      revisionId: 'R1',
      label: 'Initial code revision',
      timestamp: '10:51:40',
      filename: 'solution.py',
      language: 'python',
      summary: 'Single binary-search pass that records only the first matching index.',
      previousRevisionId: null,
      additions: 16,
      deletions: 0,
      passedCount: 3,
      totalCount: 4,
      duration: '0.04s',
      linesJson: JSON.stringify(r1Lines),
      annotationsJson: JSON.stringify([
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
      ]),
    },
  });

  await prisma.codeRevision.create({
    data: {
      sessionId: twoSumSession.id,
      revisionId: 'R2',
      label: 'Corrective code revision',
      timestamp: '11:02:31',
      filename: 'solution.py',
      language: 'python',
      summary: 'Two-pass search via a `find_bound` helper that returns either occurrence.',
      previousRevisionId: 'R1',
      additions: 20,
      deletions: 13,
      passedCount: 4,
      totalCount: 4,
      duration: '0.03s',
      linesJson: JSON.stringify(r2Lines),
      annotationsJson: JSON.stringify([
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
      ]),
    },
  });

  // Seed Test Results for ASM-2041-TSSA
  await prisma.testResult.create({
    data: {
      sessionId: twoSumSession.id,
      runId: 'run-01',
      label: 'Run after R1',
      timestamp: '10:54:12',
      revisionId: 'R1',
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
  });

  await prisma.testResult.create({
    data: {
      sessionId: twoSumSession.id,
      runId: 'run-02',
      label: 'Run after R2',
      timestamp: '11:03:09',
      revisionId: 'R2',
      passed: true,
      summary: '4 passed in 0.03s',
      output: `$ pytest -q tests/test_search_range.py
==================== test session starts =====================
collected 4 items

tests/test_search_range.py ....
==================== 4 passed in 0.03s =====================`,
    },
  });

  await prisma.testResult.create({
    data: {
      sessionId: twoSumSession.id,
      runId: 'run-03',
      label: 'Final run',
      timestamp: '11:10:22',
      revisionId: 'R2',
      passed: true,
      summary: '4 passed in 0.03s',
      output: `$ pytest -q tests/test_search_range.py
==================== test session starts =====================
collected 4 items

tests/test_search_range.py ....
==================== 4 passed in 0.03s =====================`,
    },
  });

  // Seed AI Exchanges for ASM-2041-TSSA
  await prisma.aiExchangeRecord.createMany({
    data: [
      {
        sessionId: twoSumSession.id,
        exchangeId: 'ai-01',
        role: 'candidate',
        timestamp: '10:47:18',
        text: 'I need to return the first and last index of a target in a sorted array. Is binary search the right approach here, and how should I handle duplicates?',
        eventId: 'evt-002',
      },
      {
        sessionId: twoSumSession.id,
        exchangeId: 'ai-02',
        role: 'ai',
        timestamp: '10:47:26',
        text: 'Binary search is appropriate for a sorted array. A common pattern is two passes: one biased toward the left bound and one toward the right bound, each returning an index or -1.',
        eventId: 'evt-003',
        relatedRevision: 'R1',
      },
      {
        sessionId: twoSumSession.id,
        exchangeId: 'ai-03',
        role: 'candidate',
        timestamp: '10:56:05',
        text: 'My test run fails when the target is the last element — search_range([1, 2, 3], 3) returns [-1, -1] instead of [2, 2]. Why does my loop stop before checking it?',
        eventId: 'evt-006',
      },
      {
        sessionId: twoSumSession.id,
        exchangeId: 'ai-04',
        role: 'ai',
        timestamp: '10:56:14',
        text: 'Your guard is `while left < right`, so the iteration ends when left and right are equal without evaluating that index. You also only track `first`, so the pair can never be complete. Run the search twice with a helper that accepts a flag, biasing `right = mid - 1` for the first occurrence and `left = mid + 1` for the last.',
        eventId: 'evt-007',
        relatedRevision: 'R2',
      },
    ],
  });

  // 5. Create Session for Task Manager: ASM-3088-TASK (believable full session with bug + fix)
  const taskSession = await prisma.session.create({
    data: {
      submissionId: 'ASM-3088-TASK',
      assessmentId: taskManagerAssessment.id,
      candidateId: candidate.id,
      status: 'Completed',
      startedAt: '17 Oct 2026, 02:15 PM',
      duration: '01:12:30',
      recordingDisclosureAccepted: true,
      aiPolicyLevel: 3,
    },
  });

  const taskEvents = [
    { seq: 1, timestamp: '14:15:02', category: 'navigation', title: 'Task briefing viewed', detail: 'Candidate reviewed Task Manager specs and requirements.', ref: 'evt_TM_01' },
    { seq: 2, timestamp: '14:22:15', category: 'ai-prompt', title: 'AI prompt', detail: 'Inquired about maintaining active status filters across item updates.', ref: 'evt_TM_02' },
    { seq: 3, timestamp: '14:22:24', category: 'ai-response', title: 'AI response', detail: 'Advised storing current filter state as an instance attribute.', ref: 'evt_TM_03' },
    { seq: 4, timestamp: '14:35:10', category: 'code', title: 'Initial implementation R1', detail: 'Implemented TaskManager with add, complete, and search (planted empty query bug).', ref: 'evt_TM_04', revisionId: 'R1' },
    { seq: 5, timestamp: '14:37:45', category: 'test-fail', title: 'Test run failed', detail: '1 of 5 tests failed — test_search_empty_query_returns_all returned empty list.', ref: 'evt_TM_05', revisionId: 'R1', evidenceId: 'ev-failed-test' },
    { seq: 6, timestamp: '14:41:00', category: 'question', title: 'Debugging inquiry', detail: 'Asked why empty query filter returns 0 items instead of full collection.', ref: 'evt_TM_06', evidenceId: 'ev-ai-exchange' },
    { seq: 7, timestamp: '14:41:10', category: 'ai-response', title: 'AI response', detail: 'Explained convention: empty or whitespace search query should return all tasks.', ref: 'evt_TM_07', evidenceId: 'ev-ai-exchange' },
    { seq: 8, timestamp: '14:48:30', category: 'code', title: 'Corrective code revision R2', detail: 'Added `if not query.strip(): return list(self.tasks.values())` and filter preservation.', ref: 'evt_TM_08', revisionId: 'R2', evidenceId: 'ev-revision-r2' },
    { seq: 9, timestamp: '14:49:15', category: 'test-pass', title: 'Test run passed', detail: 'All 5 test cases passed successfully.', ref: 'evt_TM_09', revisionId: 'R2' },
    { seq: 10, timestamp: '14:55:00', category: 'refactor', title: 'Code refactor', detail: 'Optimized task dictionary lookups and sanitized status validation.', ref: 'evt_TM_10', revisionId: 'R2' },
    { seq: 11, timestamp: '14:55:40', category: 'test-pass', title: 'Final test verification', detail: '5 of 5 tests passing in 0.05s.', ref: 'evt_TM_11', revisionId: 'R2' },
    { seq: 12, timestamp: '14:56:00', category: 'submission', title: 'Submission', detail: 'Assessment completed and submitted for evaluation.', ref: 'evt_TM_12' },
  ];

  for (const evt of taskEvents) {
    await prisma.sessionEvent.create({
      data: {
        sessionId: taskSession.id,
        ...evt,
      },
    });
  }

  // Seed Revisions for ASM-3088-TASK
  const taskR1Lines = [
    { kind: 'context', oldNo: 1, newNo: 1, text: 'class TaskManager:' },
    { kind: 'context', oldNo: 2, newNo: 2, text: '    def __init__(self):' },
    { kind: 'context', oldNo: 3, newNo: 3, text: '        self.tasks = {}' },
    { kind: 'context', oldNo: 4, newNo: 4, text: '        self.active_filter = None' },
    { kind: 'context', oldNo: 5, newNo: 5, text: '' },
    { kind: 'context', oldNo: 6, newNo: 6, text: '    def add_task(self, task_id, title, status="todo", priority="medium"):' },
    { kind: 'context', oldNo: 7, newNo: 7, text: '        self.tasks[task_id] = {"id": task_id, "title": title, "status": status, "priority": priority}' },
    { kind: 'context', oldNo: 8, newNo: 8, text: '' },
    { kind: 'context', oldNo: 9, newNo: 9, text: '    def search(self, query):' },
    { kind: 'context', oldNo: 10, newNo: 10, text: '        if not query:' },
    { kind: 'context', oldNo: 11, newNo: 11, text: '            return []  # Bug: returns empty list on empty query' },
    { kind: 'context', oldNo: 12, newNo: 12, text: '        return [t for t in self.tasks.values() if query.lower() in t["title"].lower()]' },
  ];

  const taskR2Lines = [
    { kind: 'context', oldNo: 1, newNo: 1, text: 'class TaskManager:' },
    { kind: 'context', oldNo: 2, newNo: 2, text: '    def __init__(self):' },
    { kind: 'context', oldNo: 3, newNo: 3, text: '        self.tasks = {}' },
    { kind: 'context', oldNo: 4, newNo: 4, text: '        self.active_filter = None' },
    { kind: 'context', oldNo: 5, newNo: 5, text: '' },
    { kind: 'context', oldNo: 6, newNo: 6, text: '    def add_task(self, task_id, title, status="todo", priority="medium"):' },
    { kind: 'context', oldNo: 7, newNo: 7, text: '        self.tasks[task_id] = {"id": task_id, "title": title, "status": status, "priority": priority}' },
    { kind: 'context', oldNo: 8, newNo: 8, text: '' },
    { kind: 'context', oldNo: 9, newNo: 9, text: '    def search(self, query):' },
    { kind: 'del', oldNo: 10, newNo: null, text: '        if not query:' },
    { kind: 'del', oldNo: 11, newNo: null, text: '            return []  # Bug: returns empty list on empty query' },
    { kind: 'add', oldNo: null, newNo: 10, text: '        if not query or not query.strip():' },
    { kind: 'add', oldNo: null, newNo: 11, text: '            return list(self.tasks.values())  # Fixed: returns all tasks' },
    { kind: 'context', oldNo: 12, newNo: 12, text: '        return [t for t in self.tasks.values() if query.lower() in t["title"].lower()]' },
  ];

  await prisma.codeRevision.create({
    data: {
      sessionId: taskSession.id,
      revisionId: 'R1',
      label: 'Initial implementation R1',
      timestamp: '14:35:10',
      filename: 'task_manager.py',
      language: 'python',
      summary: 'Task manager with add, complete, and search functions.',
      previousRevisionId: null,
      additions: 12,
      deletions: 0,
      passedCount: 4,
      totalCount: 5,
      duration: '0.06s',
      linesJson: JSON.stringify(taskR1Lines),
      annotationsJson: JSON.stringify([
        {
          line: 11,
          tone: 'danger',
          text: 'Empty query guard returns [] instead of full catalog.',
        },
      ]),
    },
  });

  await prisma.codeRevision.create({
    data: {
      sessionId: taskSession.id,
      revisionId: 'R2',
      label: 'Corrective code revision R2',
      timestamp: '14:48:30',
      filename: 'task_manager.py',
      language: 'python',
      summary: 'Fixed empty query search handling and preserved filters on update.',
      previousRevisionId: 'R1',
      additions: 2,
      deletions: 2,
      passedCount: 5,
      totalCount: 5,
      duration: '0.05s',
      linesJson: JSON.stringify(taskR2Lines),
      annotationsJson: JSON.stringify([
        {
          line: 11,
          tone: 'success',
          text: 'Empty query now returns full task catalog properly.',
        },
      ]),
    },
  });

  // Seed Test Results for ASM-3088-TASK
  await prisma.testResult.create({
    data: {
      sessionId: taskSession.id,
      runId: 'run-01',
      label: 'Run after R1',
      timestamp: '14:37:45',
      revisionId: 'R1',
      passed: false,
      summary: '1 failed, 4 passed in 0.06s',
      output: `$ pytest -q tests/test_task_manager.py
==================== test session starts =====================
collected 5 items

tests/test_task_manager.py ....F
______________________ test_search_empty_query_returns_all ______________________
    def test_search_empty_query_returns_all():
>       assert len(tm.search("")) == 3
E       AssertionError: assert 0 == 3
E         where 0 = len([])

tests/test_task_manager.py:24: AssertionError
=================== short test summary info ====================
FAILED tests/test_task_manager.py::test_search_empty_query_returns_all
================= 1 failed, 4 passed in 0.06s =================`,
    },
  });

  await prisma.testResult.create({
    data: {
      sessionId: taskSession.id,
      runId: 'run-02',
      label: 'Run after R2',
      timestamp: '14:49:15',
      revisionId: 'R2',
      passed: true,
      summary: '5 passed in 0.05s',
      output: `$ pytest -q tests/test_task_manager.py
==================== test session starts =====================
collected 5 items

tests/test_task_manager.py .....
==================== 5 passed in 0.05s =====================`,
    },
  });

  // Seed AI Exchanges for ASM-3088-TASK
  await prisma.aiExchangeRecord.createMany({
    data: [
      {
        sessionId: taskSession.id,
        exchangeId: 'ai-01',
        role: 'candidate',
        timestamp: '14:41:00',
        text: 'My search test is failing on empty query `""`. It returns zero results instead of the full list. What is the expected behavior?',
        eventId: 'evt_TM_06',
      },
      {
        sessionId: taskSession.id,
        exchangeId: 'ai-02',
        role: 'ai',
        timestamp: '14:41:10',
        text: 'In standard search UX, an empty or whitespace query indicates no active search filter, so it should return all items in the current collection rather than an empty list. Update your check to return `list(self.tasks.values())` when `not query.strip()`.',
        eventId: 'evt_TM_07',
        relatedRevision: 'R2',
      },
    ],
  });

  console.log('✅ Seed completed successfully with sessions:');
  console.log('   - ASM-2041-TSSA (Two Sum in Sorted Array)');
  console.log('   - ASM-3088-TASK (Task Manager - Full lifecycle with planted bug & fix)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
