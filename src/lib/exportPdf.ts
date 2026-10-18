import { jsPDF } from 'jspdf';
import type { AssessmentData } from '../types/assessment';

export function getReportPdfFilename(data: AssessmentData): string {
  const candidateName = (data.candidate.name || 'Candidate').replace(/\s+/g, '');
  const submissionId = data.candidate.submissionId || 'ASM-TASK';
  return `PROOF-Skill-Report-${candidateName}-${submissionId}.pdf`;
}

export function generateReportPdf(data: AssessmentData): jsPDF {
  const { candidate, finding, summary } = data;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }
  };

  // --- BRAND / HEADER BAR ---
  doc.setFillColor(15, 23, 42); // Navy #0F172A
  doc.rect(margin, y, contentWidth, 54, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('PROOF Recruiter Skill Findings Report', margin + 14, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(
    `Evidence-Driven AI Coding Assessment · Session: ${candidate.submissionId}`,
    margin + 14,
    y + 40,
  );

  y += 66;

  // --- CANDIDATE & SESSION METADATA CARD ---
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.rect(margin, y, contentWidth, 58, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('CANDIDATE', margin + 12, y + 16);
  doc.text('ROLE & LEVEL', margin + 140, y + 16);
  doc.text('ASSESSMENT', margin + 270, y + 16);
  doc.text('DURATION', margin + 410, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(candidate.name, margin + 12, y + 32);
  doc.text(candidate.role, margin + 140, y + 32);
  doc.text(candidate.assessment, margin + 270, y + 32);
  doc.text(candidate.duration, margin + 410, y + 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const now = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(`Generated: ${now} · Started: ${candidate.startedAt} · Status: ${candidate.status}`, margin + 12, y + 48);

  y += 66;

  // --- SUMMARY KPI METRICS ROW ---
  const kpiWidth = (contentWidth - 4 * 8) / 5;
  summary.slice(0, 5).forEach((m, idx) => {
    const kx = margin + idx * (kpiWidth + 8);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kx, y, kpiWidth, 34, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label.toUpperCase(), kx + 6, y + 11);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, kx + 6, y + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, kx + 6, y + 30);
  });

  y += 44;

  // --- SECTION 1: EVALUATION RUBRIC TABLE ---
  checkPageBreak(130);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Evaluation Rubric & Objective Scoring', margin, y);
  y += 14;

  const rubricRows = [
    { competency: 'Functional Correctness', weight: '30%', status: 'Demonstrated', confidence: 'High', score: '100%' },
    { competency: 'Problem Solving & Decomposition', weight: '20%', status: 'Demonstrated', confidence: 'High', score: '90%' },
    { competency: 'Debugging & Validation', weight: '20%', status: 'Demonstrated', confidence: 'High', score: '95%' },
    { competency: 'AI Collaboration & Review', weight: '15%', status: 'Demonstrated', confidence: 'High', score: '85%' },
    { competency: 'Code Understanding & Adaptability', weight: '15%', status: 'Demonstrated', confidence: 'High', score: '90%' },
  ];

  // Table header
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 20, margin + contentWidth, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('COMPETENCY', margin + 8, y + 13);
  doc.text('WEIGHT', margin + 220, y + 13);
  doc.text('STATUS', margin + 280, y + 13);
  doc.text('CONFIDENCE', margin + 370, y + 13);
  doc.text('SCORE', margin + 460, y + 13);
  y += 20;

  // Table body
  rubricRows.forEach((row, i) => {
    checkPageBreak(20);
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 18, 'F');
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 18, margin + contentWidth, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(row.competency, margin + 8, y + 12);
    doc.text(row.weight, margin + 220, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // Green
    doc.text(row.status, margin + 280, y + 12);

    doc.setTextColor(71, 85, 105);
    doc.text(row.confidence, margin + 370, y + 12);

    doc.setTextColor(15, 23, 42);
    doc.text(row.score, margin + 460, y + 12);

    y += 18;
  });

  y += 16;

  // --- SECTION 2: PRIMARY COMPETENCY FINDING ---
  checkPageBreak(150);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Competency Finding — ${finding.title}`, margin, y);
  y += 14;

  // Finding status chips row
  doc.setFillColor(240, 253, 244); // Green soft
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, 90, 18, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text(`● ${finding.status}`, margin + 8, y + 12);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin + 98, y, 100, 18, 3, 3, 'FD');
  doc.setTextColor(71, 85, 105);
  doc.text(`Confidence: ${finding.confidence}`, margin + 106, y + 12);

  doc.roundedRect(margin + 206, y, 80, 18, 3, 3, 'FD');
  doc.text(`Impact: ${finding.impact}`, margin + 214, y + 12);
  y += 26;

  // Observation Box
  checkPageBreak(70);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OBSERVATION & TELEMETRY GROUNDING', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  const obsLines = doc.splitTextToSize(finding.observation, contentWidth);
  doc.text(obsLines, margin, y);
  y += obsLines.length * 12 + 10;

  // Supporting Evidence Items
  checkPageBreak(90);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`SUPPORTING EVIDENCE (${finding.evidence.length} ITEMS)`, margin, y);
  y += 10;

  finding.evidence.forEach((ev) => {
    checkPageBreak(38);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 26, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${ev.title}`, margin + 8, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`[${ev.meta} · Event ${ev.eventId}]`, margin + 160, y + 12);

    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(ev.detail, margin + 8, y + 21);

    y += 30;
  });

  y += 8;

  // AI Contribution Analysis
  checkPageBreak(55);
  doc.setFillColor(245, 243, 255); // Violet soft
  doc.setDrawColor(221, 214, 254);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(109, 40, 217); // Violet 700
  doc.text(`AI CONTRIBUTION ANALYSIS (${finding.aiContribution.label})`, margin + 10, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const aiLines = doc.splitTextToSize(finding.aiContribution.text, contentWidth - 20);
  doc.text(aiLines, margin + 10, y + 26);
  y += 48;

  // Uncertainty & Evidence Boundary
  checkPageBreak(55);
  doc.setFillColor(254, 252, 232); // Amber soft
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, y, contentWidth, 42, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(161, 98, 7); // Amber 700
  doc.text(`UNCERTAINTY & EVIDENCE BOUNDARY (${finding.uncertainty.label})`, margin + 10, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(69, 26, 3);
  const uncertLines = doc.splitTextToSize(finding.uncertainty.text, contentWidth - 20);
  doc.text(uncertLines, margin + 10, y + 26);
  y += 50;

  // --- SECTION 3: LIMITATIONS SECTION ---
  checkPageBreak(65);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  doc.text('3. Assessment Limitations ("What this session could not show")', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const limitationsText =
    'This evaluation measures observable problem diagnosis, test-driven iteration, and AI collaboration telemetry captured during a timed sandbox task. It does not evaluate long-term code maintainability across quarterly releases, multi-service distributed systems design, asynchronous code reviews, or unassisted whiteboard synthesis outside the observable session environment.';
  const limitLines = doc.splitTextToSize(limitationsText, contentWidth);
  doc.text(limitLines, margin, y);
  y += limitLines.length * 11 + 10;

  // --- MULTI-PAGE FOOTER WITH PAGE NUMBERS ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 34, margin + contentWidth, pageHeight - 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `Generated by PROOF Assessment Engine — evidence linked to session ${candidate.submissionId}`,
      margin,
      pageHeight - 22,
    );
    doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, pageHeight - 22, {
      align: 'right',
    });
  }

  return doc;
}

export function exportReportPdf(data: AssessmentData): string {
  const filename = getReportPdfFilename(data);
  const doc = generateReportPdf(data);
  doc.save(filename);
  return filename;
}
