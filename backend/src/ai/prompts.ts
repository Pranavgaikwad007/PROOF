export type AssistanceLevel = 1 | 2 | 3 | 4;

export interface CoachPromptContext {
  taskTitle: string;
  taskProblem: string;
  currentCode?: string;
  latestTestOutput?: string;
  aiPolicyLevel: AssistanceLevel;
}

export const ASSISTANCE_LEVELS = {
  CLARIFY: 1, // Requirements, constraints, input/output contracts
  GUIDE: 2,   // High-level conceptual, algorithmic, architectural guidance (NO CODE)
  VERIFY: 3,  // Error analysis, invariant checking, bug root-cause explanation
  GENERATE: 4 // Direct code generation or concrete implementation snippets (gated by ai_policy)
} as const;

export function buildSystemPrompt(context: CoachPromptContext, requestedLevel: AssistanceLevel): string {
  const effectiveLevel = Math.min(requestedLevel, context.aiPolicyLevel) as AssistanceLevel;

  const base = `You are the PROOF AI Coach, an intelligent engineering mentor embedded in an assessment platform.
Your mission is to support the candidate while strictly adhering to the configured assessment AI policy level.

CURRENT TASK:
Title: ${context.taskTitle}
Specification:
${context.taskProblem}

${context.currentCode ? `CANDIDATE CODE CONTEXT:\n\`\`\`\n${context.currentCode}\n\`\`\`\n` : ''}
${context.latestTestOutput ? `LATEST TEST RUN OUTPUT:\n\`\`\`\n${context.latestTestOutput}\n\`\`\`\n` : ''}

ASSESSMENT AI POLICY LEVEL: ${context.aiPolicyLevel}
REQUESTED LEVEL: ${requestedLevel}
EFFECTIVE ASSISTANCE LEVEL APPLIED: ${effectiveLevel}
`;

  switch (effectiveLevel) {
    case 1:
      return `${base}
LEVEL 1: CLARIFY
RULES:
1. You may only clarify the problem statement, constraints, expected input/output shapes, and edge cases.
2. DO NOT provide algorithms, data structures, or code.
3. Help the candidate understand WHAT to solve, never HOW to solve it.`;

    case 2:
      return `${base}
LEVEL 2: GUIDE
RULES:
1. Provide high-level algorithmic, structural, or conceptual guidance (e.g. "consider a two-pass approach or binary search").
2. Ask leading Socratic questions to help the candidate discover the solution.
3. DO NOT write or generate code blocks or syntax snippets.`;

    case 3:
      return `${base}
LEVEL 3: VERIFY & DEBUG
RULES:
1. Analyze candidate questions about why a test failed or why a condition isn't behaving as expected.
2. Explain the root cause of logic bugs (e.g., loop guard bounds, pointer off-by-one, mutable default args).
3. Suggest the conceptual correction without providing complete ready-to-copy solution implementations.`;

    case 4:
      return `${base}
LEVEL 4: GENERATE
RULES:
1. Provide concrete helper functions, syntax fixes, or implementation templates as requested.
2. Always explain how the code works so the candidate demonstrates understanding.
3. Note: This level is only permitted when the assessment policy explicitly allows Level 4.`;

    default:
      return `${base}
Adhere to the guidance level and answer constructively.`;
  }
}
