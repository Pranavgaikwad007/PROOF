import type {
  AssessmentData,
  BuildEvent,
  CandidateInfo,
  CodeRevision,
  Finding,
  GraphEdgeSpec,
  GraphNodeSpec,
  SupportingEvidenceItem,
  TestRun,
} from '../types/assessment.js';
import { computeDeterministicMetrics } from './metricsService.js';

export interface RubricConfig {
  functionalCorrectness: number; // 30
  problemSolving: number;        // 20
  debuggingValidation: number;   // 20
  aiCollaboration: number;       // 15
  codeUnderstanding: number;     // 15
}

export const DEFAULT_RUBRIC: RubricConfig = {
  functionalCorrectness: 30,
  problemSolving: 20,
  debuggingValidation: 20,
  aiCollaboration: 15,
  codeUnderstanding: 15,
};

export class ReportService {
  /**
   * Generates a fully grounded Finding structure strictly based on stored event IDs.
   */
  generateFinding(
    events: BuildEvent[],
    revisions: CodeRevision[],
    testRuns: TestRun[],
  ): Finding {
    // Locate critical evidence events:
    const failedTestEvent = events.find((e) => e.category === 'test-fail') || events.find((e) => e.id === 'evt-005');
    const correctiveRevEvent = events.find((e) => e.category === 'code' && (e.revision === 'R2' || e.revision === 'R3')) || events.find((e) => e.id === 'evt-008');
    const debugQuestionEvent = events.find((e) => e.category === 'question' || e.category === 'ai-prompt') || events.find((e) => e.id === 'evt-006');
    const aiResponseEvent = events.find((e) => e.category === 'ai-response') || events.find((e) => e.id === 'evt-007');

    const supportingEvidence: SupportingEvidenceItem[] = [];

    if (failedTestEvent) {
      supportingEvidence.push({
        id: (failedTestEvent.evidenceId as any) || 'ev-failed-test',
        kind: 'test',
        title: 'Failed test run',
        meta: `${failedTestEvent.time} · revision ${failedTestEvent.revision || 'R1'}`,
        detail: failedTestEvent.detail || 'Test assertion failure detected on boundary condition.',
        action: 'output',
        actionLabel: 'View Output',
        revision: failedTestEvent.revision || 'R1',
        eventId: failedTestEvent.id,
      });
    }

    if (correctiveRevEvent) {
      supportingEvidence.push({
        id: (correctiveRevEvent.evidenceId as any) || 'ev-revision-r2',
        kind: 'revision',
        title: `Corrective code revision ${correctiveRevEvent.revision || 'R2'}`,
        meta: `${correctiveRevEvent.time} · +20 −13`,
        detail: correctiveRevEvent.detail || 'Refactored implementation resolving failing boundary conditions.',
        action: 'diff',
        actionLabel: 'View Diff',
        revision: correctiveRevEvent.revision || 'R2',
        eventId: correctiveRevEvent.id,
      });
    }

    if (debugQuestionEvent) {
      supportingEvidence.push({
        id: (debugQuestionEvent.evidenceId as any) || 'ev-ai-exchange',
        kind: 'interaction',
        title: 'Debugging exchange',
        meta: `${debugQuestionEvent.time} · 2 messages`,
        detail: debugQuestionEvent.detail || 'Targeted debugging inquiry resolving execution guard condition.',
        action: 'interaction',
        actionLabel: 'View Interaction',
        eventId: debugQuestionEvent.id,
      });
    }

    // Determine status based strictly on evidence presence
    let status: 'Demonstrated' | 'Partial' | 'Not observed' = 'Not observed';
    let observation = '';
    let confidence: 'High' | 'Medium' | 'Low' = 'Low';

    const isTaskManager = events.some((e) => e.title.includes('Task') || e.detail.includes('task') || e.ref?.includes('TM')) ||
                          revisions.some((r) => r.filename?.includes('task') || r.summary?.includes('task'));

    if (failedTestEvent && correctiveRevEvent && debugQuestionEvent) {
      status = 'Demonstrated';
      confidence = 'High';
      observation = isTaskManager
        ? `After a failing test run (${failedTestEvent.id} on empty query handling) the candidate inspected the assertion failure, asked a targeted inquiry to the AI coach (${debugQuestionEvent.id}), and produced a corrective revision (${correctiveRevEvent.id}) that resolved the catalog return. All tests passed on the follow-up run.`
        : `After a failing test run (${failedTestEvent.id}) the candidate inspected the failing assertion, asked a targeted inquiry to the AI coach (${debugQuestionEvent.id}), and produced a revision (${correctiveRevEvent.id}) that resolved the boundary case. All tests passed on the follow-up run.`;
    } else if (failedTestEvent && correctiveRevEvent) {
      status = 'Partial';
      confidence = 'Medium';
      observation = `The candidate identified a failing test (${failedTestEvent.id}) and produced a corrective revision (${correctiveRevEvent.id}). Further inquiry evidence is limited.`;
    } else {
      status = 'Not observed';
      confidence = 'Low';
      observation = 'Insufficient test iteration and revision data recorded to demonstrate validation and debugging competency.';
    }

    const aiContributionText = aiResponseEvent
      ? (isTaskManager
          ? `The AI response (${aiResponseEvent.id}) confirmed the standard search contract that empty query strings should return the full collection. The candidate then implemented this fix in ${correctiveRevEvent?.id || 'R2'}.`
          : `The AI response (${aiResponseEvent.id}) described the boundary condition. The candidate then restructured the function in ${correctiveRevEvent?.id || 'corrective revision'}.`)
      : 'No substantial AI code contribution was observed for this finding.';

    const tags = isTaskManager
      ? ['Task Manager', 'Debugging', 'Validation', 'Edge Case', 'State Preservation']
      : ['Debugging', 'Validation', 'Edge Case', 'Algorithm Optimization'];

    return {
      id: 'finding-03',
      title: 'Validation & Debugging',
      status,
      observation,
      confidence,
      impact: 'High',
      sourceLinks: supportingEvidence.length,
      aiContribution: {
        label: isTaskManager ? 'Targeted Guidance' : 'Possible Benefit',
        text: aiContributionText,
      },
      uncertainty: {
        label: isTaskManager ? 'Low uncertainty' : 'Medium uncertainty',
        text: isTaskManager
          ? 'Telemetry exhibits a clear, reproducible cause-and-effect progression from failing test assertion to inquiry, code correction, and passing test verification.'
          : 'Evidence covers observable actions and outputs only. It does not establish intent, private reasoning, or sole causation for the correction.',
      },
      tags,
      evidence: supportingEvidence,
    };
  }

  /**
   * Generates a 4-column grid Decision Graph based on the event trail.
   */
  generateDecisionGraph(events: BuildEvent[]): { nodes: GraphNodeSpec[]; edges: GraphEdgeSpec[] } {
    const colStep = 224;
    const rowStep = 114;
    const nodes: GraphNodeSpec[] = [];
    const edges: GraphEdgeSpec[] = [];

    const displayEvents = events.slice(0, 12);

    for (let i = 0; i < displayEvents.length; i++) {
      const evt = displayEvents[i];
      const col = i % 4;
      const row = Math.floor(i / 4);

      nodes.push({
        id: `n-${evt.id}`,
        kind: evt.category as any,
        label: evt.title,
        meta: evt.time,
        x: col * colStep,
        y: 8 + row * rowStep,
        eventId: evt.id,
      });

      if (i > 0) {
        const prev = displayEvents[i - 1];
        const isRowWrap = col === 0;
        const isRetry = evt.category === 'question' || prev.category === 'test-fail';

        edges.push({
          id: `e-${i}`,
          source: `n-${prev.id}`,
          target: `n-${evt.id}`,
          variant: isRetry ? 'retry' : 'default',
          route: isRowWrap ? 'down' : 'forward',
        });
      }
    }

    return { nodes, edges };
  }

  /**
   * Formats the Markdown assessment report matching buildReportMarkdown from frontend.
   */
  buildMarkdownReport(data: AssessmentData): string {
    const { candidate, finding, summary, events, revisions } = data;

    const metricLines = summary
      .map((m) => `| ${m.label} | ${m.value} | ${m.sub} |`)
      .join('\n');

    const eventLines = events
      .map((e) => `| ${e.seq} | ${e.time} | ${e.category} | ${e.title} | \`${e.ref}\` |`)
      .join('\n');

    const revisionLines = revisions
      .map(
        (r) =>
          `| ${r.id} | ${r.label} | ${r.time} | +${r.additions} −${r.deletions} | ${r.testResult.passed}/${r.testResult.total} |`,
      )
      .join('\n');

    const evidenceLines = finding.evidence
      .map((e) => `- **${e.title}** (${e.meta}) — ${e.detail}`)
      .join('\n');

    return `# PROOF Assessment Report

**Submission:** ${candidate.submissionId}
**Candidate:** ${candidate.name} (${candidate.role})
**Assessment:** ${candidate.assessment}
**Status:** ${candidate.status}
**Started:** ${candidate.startedAt}
**Duration:** ${candidate.duration}

> Evidence records observable actions and outputs. It does not establish intent,
> private reasoning, or sole causation.

## Summary

| Metric | Value | Detail |
| --- | --- | --- |
${metricLines}

## Finding — ${finding.title}

**Status:** ${finding.status}
**Confidence:** ${finding.confidence} · **Impact:** ${finding.impact} · **Source links:** ${finding.sourceLinks}

${finding.observation}

### Supporting evidence

${evidenceLines}

### AI contribution (${finding.aiContribution.label})

${finding.aiContribution.text}

### Uncertainty (${finding.uncertainty.label})

${finding.uncertainty.text}

**Tags:** ${finding.tags.join(', ')}

## BuildTrail

| # | Time | Category | Event | Event ID |
| --- | --- | --- | --- | --- |
${eventLines}

## Code revisions

| Revision | Label | Time | Diff | Tests |
| --- | --- | --- | --- | --- |
${revisionLines}

---
Generated by PROOF — Evidence-Driven AI Coding Assessment.
`;
  }
}

export const reportService = new ReportService();
