import { Router } from 'express';
import { aiCoach } from '../ai/coach.js';
import type { AssistanceLevel } from '../ai/prompts.js';
import { prisma } from '../db/prisma.js';
import { validateBody } from '../middleware/validate.js';
import { sessionService } from '../services/sessionService.js';
import {
  AiCoachRequestSchema,
  RunTestRequestSchema,
  type AiExchange,
} from '../types/assessment.js';

const router = Router();

/**
 * POST /api/candidates/assessments/:id/runs
 * Request body: { revisionId: RevisionId, code: string }
 * Response shape: TestRun
 */
router.post(
  '/assessments/:id/runs',
  validateBody(RunTestRequestSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { revisionId, code } = req.body;

      const testRun = await sessionService.executeTestRun(id, revisionId, code);
      res.json(testRun);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/candidates/assessments/:id/ai-coach
 * Request body: { prompt: string, contextRevisionId?: RevisionId }
 * Response shape: AiExchange (or SSE stream if Accept: text/event-stream or ?stream=true)
 */
router.post(
  '/assessments/:id/ai-coach',
  validateBody(AiCoachRequestSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { prompt, contextRevisionId } = req.body;

      const session = await prisma.session.findFirst({
        where: { OR: [{ id }, { submissionId: id }] },
        include: {
          assessment: true,
          revisions: true,
          testResults: true,
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Assessment session not found' });
      }

      const latestRev = session.revisions.find((r) => r.revisionId === contextRevisionId) ||
        session.revisions[session.revisions.length - 1];
      const latestTest = session.testResults[session.testResults.length - 1];

      const coachContext = {
        taskTitle: session.assessment.title,
        taskProblem: session.assessment.problem,
        currentCode: latestRev?.linesJson ? JSON.parse(latestRev.linesJson).map((l: any) => l.text).join('\n') : undefined,
        latestTestOutput: latestTest?.output,
        aiPolicyLevel: session.aiPolicyLevel as AssistanceLevel,
      };

      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];
      const exchangeCount = await prisma.aiExchangeRecord.count({ where: { sessionId: session.id } });
      const exchangeIndex = exchangeCount + 1;
      const exchangeId = `ai-${exchangeIndex < 10 ? '0' + exchangeIndex : exchangeIndex}`;

      // Ingest candidate prompt event
      const promptEvent = await sessionService.ingestEvent(session.id, {
        category: 'ai-prompt',
        title: 'AI prompt',
        detail: prompt,
        revision: contextRevisionId,
        timestamp,
      });

      // Record candidate prompt exchange
      await prisma.aiExchangeRecord.create({
        data: {
          sessionId: session.id,
          exchangeId: `ai-${exchangeIndex}-prompt`,
          role: 'candidate',
          timestamp,
          text: prompt,
          eventId: promptEvent.id,
          relatedRevision: contextRevisionId,
          assistanceLevel: aiCoach.detectRequestedLevel(prompt),
        },
      });

      const wantsStream =
        req.headers.accept === 'text/event-stream' || req.query.stream === 'true';

      if (wantsStream) {
        // Setup SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        await aiCoach.streamResponse(prompt, coachContext, {
          onChunk: (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          },
          onDone: async (fullText) => {
            const responseTime = new Date().toTimeString().split(' ')[0];
            const responseEvent = await sessionService.ingestEvent(session.id, {
              category: 'ai-response',
              title: 'AI response',
              detail: fullText.substring(0, 140) + (fullText.length > 140 ? '...' : ''),
              revision: contextRevisionId,
              timestamp: responseTime,
            });

            await prisma.aiExchangeRecord.create({
              data: {
                sessionId: session.id,
                exchangeId,
                role: 'ai',
                timestamp: responseTime,
                text: fullText,
                eventId: responseEvent.id,
                relatedRevision: contextRevisionId,
                assistanceLevel: aiCoach.detectRequestedLevel(prompt),
              },
            });

            const finalPayload: AiExchange = {
              id: exchangeId,
              role: 'ai',
              time: responseTime,
              text: fullText,
              eventId: responseEvent.id,
              relatedRevision: contextRevisionId as any,
            };

            res.write(`data: ${JSON.stringify({ done: true, exchange: finalPayload })}\n\n`);
            res.end();
          },
          onError: (err) => {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
          },
        });
        return;
      }

      // Non-streaming standard response
      let responseText = '';
      await aiCoach.streamResponse(prompt, coachContext, {
        onChunk: () => {},
        onDone: (text) => {
          responseText = text;
        },
        onError: (err) => {
          throw err;
        },
      });

      const responseTime = new Date().toTimeString().split(' ')[0];
      const responseEvent = await sessionService.ingestEvent(session.id, {
        category: 'ai-response',
        title: 'AI response',
        detail: responseText.substring(0, 140) + (responseText.length > 140 ? '...' : ''),
        revision: contextRevisionId,
        timestamp: responseTime,
      });

      await prisma.aiExchangeRecord.create({
        data: {
          sessionId: session.id,
          exchangeId,
          role: 'ai',
          timestamp: responseTime,
          text: responseText,
          eventId: responseEvent.id,
          relatedRevision: contextRevisionId,
          assistanceLevel: aiCoach.detectRequestedLevel(prompt),
        },
      });

      const responseExchange: AiExchange = {
        id: exchangeId,
        role: 'ai',
        time: responseTime,
        text: responseText,
        eventId: responseEvent.id,
        relatedRevision: contextRevisionId as any,
      };

      res.json(responseExchange);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
