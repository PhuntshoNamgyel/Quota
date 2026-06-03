// src/middleware/auth.ts
// Security layer: JWT authentication + Role-Based Access Control (RBAC).
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../models';

// What we encode inside the token.
export interface JwtPayload {
  userId: number;
  role: Role;
}

// Make the authenticated user available on every request (TypeScript augmentation).
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const secret = () => process.env.JWT_SECRET || 'fallback_secret';

// Verifies the JWT on protected requests; rejects missing/invalid tokens (NFR03).
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed token' });
    return;
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], secret()) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// RBAC: restricts a route to specific roles. This is the RBAC pattern in action.
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}