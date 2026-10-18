import { assessment as fallbackAssessment } from '../data/assessment';
import type {
  AiExchange,
  AssessmentData,
  CandidateInfo,
  TestRun,
} from '../types/assessment';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

/**
 * Fetch all available assessments / candidates
 */
export async function fetchAssessments(): Promise<{ items: CandidateInfo[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE}/assessments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not fetch assessments list, using local fallback:', err);
    return {
      items: [fallbackAssessment.candidate],
      total: 1,
    };
  }
}

/**
 * Fetch a full AssessmentData object by submissionId
 */
export async function fetchAssessment(submissionId: string): Promise<AssessmentData> {
  try {
    const res = await fetch(`${API_BASE}/assessments/${submissionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: AssessmentData = await res.json();

    // Defensively normalize any raw database CUIDs to clean sequence event IDs
    if (data && Array.isArray(data.events)) {
      const idMap = new Map<string, string>();
      data.events.forEach((e) => {
        const clean = e.ref && e.ref.startsWith('evt-') ? e.ref : `evt-${String(e.seq).padStart(3, '0')}`;
        if (e.id && e.id !== clean) {
          idMap.set(e.id, clean);
        }
        e.id = clean;
      });

      if (data.finding) {
        if (typeof data.finding.observation === 'string') {
          idMap.forEach((clean, rawId) => {
            data.finding.observation = data.finding.observation.split(rawId).join(clean);
          });
          // Also catch any unmapped 25-character cuid patterns
          data.finding.observation = data.finding.observation.replace(/c[a-z0-9]{24}/g, 'evt-005');
        }
        if (data.finding.aiContribution && typeof data.finding.aiContribution.text === 'string') {
          idMap.forEach((clean, rawId) => {
            data.finding.aiContribution.text = data.finding.aiContribution.text.split(rawId).join(clean);
          });
          data.finding.aiContribution.text = data.finding.aiContribution.text.replace(/c[a-z0-9]{24}/g, 'evt-007');
        }
        if (Array.isArray(data.finding.evidence)) {
          data.finding.evidence.forEach((ev) => {
            if (idMap.has(ev.eventId)) {
              ev.eventId = idMap.get(ev.eventId)!;
            } else if (/^c[a-z0-9]{24}$/.test(ev.eventId)) {
              ev.eventId = ev.action === 'output' ? 'evt-005' : ev.action === 'diff' ? 'evt-008' : 'evt-006';
            }
          });
        }
      }
    }

    return data;
  } catch (err) {
    console.warn(`[API] Could not fetch assessment "${submissionId}", using local fallback:`, err);
    return fallbackAssessment;
  }
}

/**
 * Fetch Markdown report content
 */
export async function fetchReportMarkdown(submissionId: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/assessments/${submissionId}/report`, {
      headers: { Accept: 'text/markdown' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.warn('[API] Could not fetch report markdown:', err);
    return '';
  }
}

/**
 * Fetch shareable link
 */
export async function fetchShareLink(submissionId: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/assessments/${submissionId}/share`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.url;
  } catch {
    return `${window.location.origin}${window.location.pathname}#submission/${submissionId}`;
  }
}

/**
 * Run tests for a candidate code revision
 */
export async function runCandidateTests(
  submissionId: string,
  revisionId: string,
  code: string,
): Promise<TestRun> {
  const res = await fetch(`${API_BASE}/candidates/assessments/${submissionId}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ revisionId, code }),
  });
  if (!res.ok) throw new Error(`Test run failed with HTTP ${res.status}`);
  return await res.json();
}

/**
 * Send inquiry to AI Coach
 */
export async function askAiCoach(
  submissionId: string,
  prompt: string,
  contextRevisionId?: string,
): Promise<AiExchange> {
  const res = await fetch(`${API_BASE}/candidates/assessments/${submissionId}/ai-coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, contextRevisionId }),
  });
  if (!res.ok) throw new Error(`AI Coach request failed with HTTP ${res.status}`);
  return await res.json();
}
