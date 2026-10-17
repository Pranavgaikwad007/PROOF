import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../db/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN as any },
  );
}

/**
 * Authentication middleware supporting standard Bearer JWT and demo-tokens
 */
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // If demo bypass query or header is present for testing
    const demoRole = req.headers['x-demo-role'] as string;
    if (demoRole === 'recruiter' || demoRole === 'candidate' || demoRole === 'admin') {
      req.user = {
        id: `demo-${demoRole}-id`,
        email: `${demoRole}@proof.dev`,
        role: demoRole as any,
        name: demoRole === 'recruiter' ? 'Demo Recruiter' : 'Demo Candidate',
      };
      return next();
    }
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Format must be: Bearer <token>' });
  }

  const token = parts[1];

  // Check for special demo token strings for quick CLI testing
  if (token === 'demo-recruiter-token') {
    req.user = {
      id: 'demo-recruiter-id',
      email: 'recruiter@proof.dev',
      role: 'recruiter',
      name: 'Demo Recruiter',
    };
    return next();
  }

  if (token === 'demo-candidate-token') {
    req.user = {
      id: 'demo-candidate-id',
      email: 'candidate@proof.dev',
      role: 'candidate',
      name: 'Demo Candidate',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthUser;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: Array<'candidate' | 'recruiter' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: role '${req.user.role}' is not authorized. Requires: ${allowedRoles.join(', ')}`,
      });
    }
    return next();
  };
}
