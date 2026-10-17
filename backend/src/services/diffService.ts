import type { DiffLine } from '../types/assessment.js';

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

/**
 * Computes a unified diff line structure between oldCode and newCode.
 * If oldCode is null/empty, treats all lines as context/initial.
 */
export function computeDiffLines(oldCode: string | null | undefined, newCode: string): DiffResult {
  const newLines = newCode.split('\n');

  if (!oldCode || oldCode.trim() === '') {
    // Initial revision: all lines are context
    const lines: DiffLine[] = newLines.map((line, idx) => ({
      kind: 'context',
      oldNo: idx + 1,
      newNo: idx + 1,
      text: line,
    }));
    return {
      lines,
      additions: newLines.length,
      deletions: 0,
    };
  }

  const oldLines = oldCode.split('\n');
  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;

  // Simple Myers-style or LCS diffing for line arrays
  const lcs = computeLcs(oldLines, newLines);
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  let currentOldNo = 1;
  let currentNewNo = 1;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (
      lcsIdx < lcs.length &&
      oldIdx < oldLines.length &&
      newIdx < newLines.length &&
      oldLines[oldIdx] === lcs[lcsIdx] &&
      newLines[newIdx] === lcs[lcsIdx]
    ) {
      lines.push({
        kind: 'context',
        oldNo: currentOldNo++,
        newNo: currentNewNo++,
        text: oldLines[oldIdx],
      });
      oldIdx++;
      newIdx++;
      lcsIdx++;
    } else {
      // Consume deletions from old lines
      while (oldIdx < oldLines.length && (lcsIdx >= lcs.length || oldLines[oldIdx] !== lcs[lcsIdx])) {
        lines.push({
          kind: 'del',
          oldNo: currentOldNo++,
          newNo: null,
          text: oldLines[oldIdx],
        });
        oldIdx++;
        deletions++;
      }
      // Consume additions from new lines
      while (newIdx < newLines.length && (lcsIdx >= lcs.length || newLines[newIdx] !== lcs[lcsIdx])) {
        lines.push({
          kind: 'add',
          oldNo: null,
          newNo: currentNewNo++,
          text: newLines[newIdx],
        });
        newIdx++;
        additions++;
      }
    }
  }

  return { lines, additions, deletions };
}

function computeLcs(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (a[i] === b[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}
