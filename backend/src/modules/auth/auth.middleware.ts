import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from './auth.types';

// Erweitere die Express Request-Schnittstelle
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Authentifizierungs-Middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Kein Token vorhanden'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Ungültiger Token'
    });
  }
};

// Autorisierungs-Middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Nicht authentifiziert'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Nicht autorisiert'
      });
    }

    next();
  };
}; 