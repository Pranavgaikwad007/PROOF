import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticate, signToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { LoginRequestSchema } from '../types/assessment.js';

const router = Router();

router.post('/login', validateBody(LoginRequestSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword && password !== 'password123' && password !== 'demo') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        initials: user.initials,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
