import type { ICodeRunner, RunnerResult, RunnerTestInput, TestCaseResult } from './types.js';

/**
 * Isolated Stub Runner Implementation
 *
 * CRITICAL SECURITY ARCHITECTURE NOTE:
 * Candidate code is NEVER executed directly inside this API process.
 * In production, this runner dispatches jobs to an ephemeral, isolated Docker sandbox container
 * (e.g., gVisor, Firecracker VM, or Docker with cgroups resource limits, seccomp profiles, and no network access).
 *
 * TODO [DOCKER SANDBOX INTEGRATION]:
 * 1. Build an unprivileged runner container image with language toolchains (python3, pytest, node, jest).
 * 2. Mount `input.files` and `input.tests` into a tmpfs directory with `read_only` root.
 * 3. Set resource limits: `--memory=256m --cpus=0.5 --pids-limit=64 --network=none`.
 * 4. Capture stdout/stderr with a hard timeout of `input.timeoutMs || 5000`.
 * 5. Parse test runner JSON report (e.g., pytest --json-report or junit-xml) into `TestCaseResult[]`.
 */
export class SafeStubRunner implements ICodeRunner {
  async run(input: RunnerTestInput): Promise<RunnerResult> {
    const mainFile = input.files[0]?.content || '';
    const testCode = input.tests || '';

    // Deterministic simulation based on code properties
    // Check for common task conditions:
    const isTaskManager = testCode.includes('test_task_manager') || mainFile.includes('TaskManager') || mainFile.includes('filter_tasks');
    const isTwoSum = testCode.includes('test_search_range') || mainFile.includes('search_range') || mainFile.includes('find_bound');

    if (isTaskManager) {
      return this.evaluateTaskManager(mainFile);
    } else if (isTwoSum) {
      return this.evaluateTwoSum(mainFile);
    }

    // Generic fallback stub evaluation
    return this.evaluateGeneric(mainFile);
  }

  private evaluateTwoSum(code: string): RunnerResult {
    // Check if code has corrected the loop guard from left < right to left <= right and has find_bound
    const hasCorrectGuard = code.includes('left <= right');
    const hasDualBound = code.includes('find_bound') || (code.includes('find_first') && code.includes('find_last'));

    if (hasCorrectGuard && hasDualBound) {
      const testCases: TestCaseResult[] = [
        { name: 'test_basic_pair', passed: true, durationMs: 8 },
        { name: 'test_single_occurrence', passed: true, durationMs: 7 },
        { name: 'test_not_found', passed: true, durationMs: 7 },
        { name: 'test_target_at_upper_bound', passed: true, durationMs: 8 },
      ];
      return {
        passed: true,
        passedCount: 4,
        totalCount: 4,
        durationStr: '0.03s',
        output: `$ pytest -q tests/test_search_range.py
==================== test session starts =====================
collected 4 items

tests/test_search_range.py ....
==================== 4 passed in 0.03s =====================`,
        testCases,
      };
    } else {
      const testCases: TestCaseResult[] = [
        { name: 'test_basic_pair', passed: true, durationMs: 11 },
        { name: 'test_single_occurrence', passed: true, durationMs: 9 },
        { name: 'test_not_found', passed: true, durationMs: 8 },
        {
          name: 'test_target_at_upper_bound',
          passed: false,
          durationMs: 12,
          failureMessage: 'AssertionError: assert [-1, -1] == [2, 2]',
        },
      ];
      return {
        passed: false,
        passedCount: 3,
        totalCount: 4,
        durationStr: '0.04s',
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
        testCases,
      };
    }
  }

  private evaluateTaskManager(code: string): RunnerResult {
    const hasAdd = code.includes('add_task') || code.includes('add');
    const hasFilter = code.includes('filter_by_status') || code.includes('filter');
    const hasEmptyQueryFix = code.includes('if not query') || code.includes("query.strip() == ''") || code.includes('if not title');
    const preservesFiltersOnUpdate = code.includes('preserve') || code.includes('keep_filters') || code.includes('status == self.active_filter');

    const testCases: TestCaseResult[] = [
      { name: 'test_list_tasks', passed: hasAdd, durationMs: 6 },
      { name: 'test_add_and_complete_task', passed: hasAdd, durationMs: 7 },
      { name: 'test_filter_by_status', passed: hasFilter, durationMs: 8 },
      {
        name: 'test_search_empty_query_returns_all',
        passed: hasEmptyQueryFix,
        durationMs: 9,
        failureMessage: hasEmptyQueryFix ? undefined : 'AssertionError: empty search returned 0 items, expected full task list',
      },
      {
        name: 'test_preserve_filters_on_update',
        passed: preservesFiltersOnUpdate && hasEmptyQueryFix,
        durationMs: 10,
        failureMessage: preservesFiltersOnUpdate && hasEmptyQueryFix ? undefined : 'AssertionError: updating task reset filter state unexpectedly',
      },
    ];

    const passedCount = testCases.filter((t) => t.passed).length;
    const totalCount = testCases.length;
    const passed = passedCount === totalCount;

    let output = `$ pytest -q tests/test_task_manager.py\n==================== test session starts =====================\ncollected 5 items\n\n`;
    if (passed) {
      output += `tests/test_task_manager.py .....\n==================== 5 passed in 0.05s =====================`;
    } else {
      const failed = testCases.filter((t) => !t.passed);
      output += `tests/test_task_manager.py ${testCases.map((t) => (t.passed ? '.' : 'F')).join('')}\n`;
      for (const f of failed) {
        output += `\n______________________ ${f.name} ______________________\nE       ${f.failureMessage}\n`;
      }
      output += `\n================= ${totalCount - passedCount} failed, ${passedCount} passed in 0.06s =================`;
    }

    return {
      passed,
      passedCount,
      totalCount,
      durationStr: passed ? '0.05s' : '0.06s',
      output,
      testCases,
    };
  }

  private evaluateGeneric(code: string): RunnerResult {
    const hasCode = code.trim().length > 20;
    const passedCount = hasCode ? 3 : 1;
    const totalCount = 3;
    const passed = hasCode;

    return {
      passed,
      passedCount,
      totalCount,
      durationStr: '0.04s',
      output: `$ pytest -q tests/test_solution.py
==================== test session starts =====================
collected 3 items

tests/test_solution.py ${passed ? '...' : '.FF'}
================= ${passed ? '3 passed in 0.04s' : '2 failed, 1 passed in 0.04s'} =================`,
      testCases: [
        { name: 'test_default_case', passed: true, durationMs: 10 },
        { name: 'test_edge_case', passed: hasCode, durationMs: 12 },
        { name: 'test_boundary_conditions', passed: hasCode, durationMs: 14 },
      ],
    };
  }
}

export const runner = new SafeStubRunner();
