export interface RunnerFile {
  filename: string;
  content: string;
}

export interface RunnerTestInput {
  files: RunnerFile[];
  tests: string;
  language?: string;
  timeoutMs?: number;
}

export interface TestCaseResult {
  name: string;
  passed: boolean;
  durationMs: number;
  failureMessage?: string;
}

export interface RunnerResult {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  durationStr: string;
  output: string;
  testCases: TestCaseResult[];
}

export interface ICodeRunner {
  run(input: RunnerTestInput): Promise<RunnerResult>;
}
