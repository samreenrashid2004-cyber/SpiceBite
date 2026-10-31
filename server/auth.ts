import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'masalamunch-secret-super-secure-key-2026';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    // Check if user still exists in database
    const user = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(decoded.id) as AuthUser | undefined;
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      const user = db.prepare('SELECT id, name, email, role, phone FROM users WHERE id = ?').get(decoded.id) as AuthUser | undefined;
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
}
