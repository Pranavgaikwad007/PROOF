import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { reportService } from '../services/reportService.js';
import { sessionService } from '../services/sessionService.js';
import type { CandidateInfo } from '../types/assessment.js';

const router = Router();

/**
 * GET /api/assessments
 * List assessments / candidates summary
 * Returns: { items: CandidateInfo[], total: number }
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt((req.query.limit as string) || '20', 10)));
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { candidate: true, assessment: true },
      }),
      prisma.session.count(),
    ]);

    const items: CandidateInfo[] = sessions.map((s) => ({
      name: s.candidate.name,
      initials: s.candidate.initials,
      role: s.assessment.role,
      status: s.status,
      startedAt: s.startedAt,
      duration: s.duration,
      assessment: s.assessment.title,
      problem: s.assessment.problem,
      submissionId: s.submissionId,
    }));

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assessments/:submissionId
 * Returns complete AssessmentData matching FRONTEND_CONTRACT.md verbatim
 */
router.get('/:submissionId', async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const assessmentData = await sessionService.getAssessmentData(submissionId);
    res.json(assessmentData);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assessments/:submissionId/report
 * Returns Markdown assessment report
 */
router.get('/:submissionId/report', async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const assessmentData = await sessionService.getAssessmentData(submissionId);
    const markdown = reportService.buildMarkdownReport(assessmentData);

    const accept = req.headers.accept || '';
    if (accept.includes('text/markdown') || accept.includes('text/plain')) {
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      return res.send(markdown);
    }

    res.json({
      submissionId,
      markdown,
      data: assessmentData,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/assessments/:submissionId/share
 * Generates shareable URL
 * Returns: { url: string, submissionId: string }
 */
router.get('/:submissionId/share', async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const session = await prisma.session.findUnique({ where: { submissionId } });
    if (!session) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol || 'http';
    const url = `${protocol}://${host}/#submission/${submissionId}`;

    res.json({
      url,
      submissionId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
