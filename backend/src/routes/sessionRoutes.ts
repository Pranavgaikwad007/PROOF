import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { sessionService } from '../services/sessionService.js';
import {
  IngestEventRequestSchema,
  RecordTestRunRequestSchema,
  SaveRevisionRequestSchema,
  StartSessionRequestSchema,
} from '../types/assessment.js';

const router = Router();

/**
 * POST /api/sessions
 * Start a new assessment session
 */
router.post('/', validateBody(StartSessionRequestSchema), async (req, res, next) => {
  try {
    const session = await sessionService.startSession(req.body);
    res.status(201).json({
      message: 'Assessment session started',
      sessionId: session.id,
      submissionId: session.submissionId,
      session,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/events
 * Ingest telemetry / candidate events
 */
router.post('/:id/events', validateBody(IngestEventRequestSchema), async (req, res, next) => {
  try {
    const event = await sessionService.ingestEvent(req.params.id, req.body);
    res.status(201).json({
      message: 'Event recorded',
      event,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/revisions
 * Save code revision with unified diff computation against previous revision
 */
router.post('/:id/revisions', validateBody(SaveRevisionRequestSchema), async (req, res, next) => {
  try {
    const revision = await sessionService.saveRevision(req.params.id, req.body);
    res.status(201).json({
      message: 'Code revision saved',
      revisionId: revision.revisionId,
      revision,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/runs
 * Record test run
 */
router.post('/:id/runs', validateBody(RecordTestRunRequestSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { revisionId, code } = req.body as any;
    const testRun = await sessionService.executeTestRun(id, revisionId, code || '');
    res.status(201).json(testRun);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/sessions/:id/end
 * End assessment session and generate report
 */
router.post('/:id/end', async (req, res, next) => {
  try {
    const assessmentData = await sessionService.endSession(req.params.id);
    res.json({
      message: 'Assessment session completed and report generated',
      assessmentData,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
