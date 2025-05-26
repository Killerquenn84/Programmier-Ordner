import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Sichere JWT-Konfiguration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '1h'; // Kürzere Token-Gültigkeit für erhöhte Sicherheit

export interface TokenPayload {
  userId: string;
  role: string;
  doctorId?: string;
  patientId?: string;
  sessionId: string; // Eindeutige Session-ID für besseres Tracking
  iat?: number; // Issued At
  exp?: number; // Expiration Time
}

// Erweiterte Token-Generierung mit zusätzlichen Sicherheitsmaßnahmen
export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const enhancedPayload = {
    ...payload,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 Stunde
  };

  return jwt.sign(enhancedPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS512', // Stärkerer Algorithmus
    jwtid: sessionId // Eindeutige Token-ID
  });
};

// Erweiterte Token-Verifizierung mit zusätzlichen Sicherheitsprüfungen
export const verifyToken = (token: string): TokenPayload => {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS512'],
      complete: true
    }) as jwt.Jwt & { payload: TokenPayload };

    // Zusätzliche Sicherheitsprüfungen
    if (!payload.payload.sessionId) {
      throw new Error('Ungültiger Token: Keine Session-ID');
    }

    return payload.payload;
  } catch (error) {
    throw new Error('Ungültiger Token');
  }
};

// Erweiterte Authentifizierungs-Middleware mit zusätzlichen Sicherheitsmaßnahmen
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Kein Token vorhanden',
      code: 'AUTH_NO_TOKEN'
    });
  }

  try {
    const payload = verifyToken(token);
    
    // Überprüfe Token-Ablauf
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        message: 'Token abgelaufen',
        code: 'AUTH_TOKEN_EXPIRED'
      });
    }

    // Füge zusätzliche Sicherheits-Header hinzu
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Ungültiger Token',
      code: 'AUTH_INVALID_TOKEN'
    });
  }
};

// Erweiterte Rollenprüfung mit zusätzlichen Sicherheitsmaßnahmen
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Nicht authentifiziert',
        code: 'AUTH_NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Keine Berechtigung',
        code: 'AUTH_INSUFFICIENT_PERMISSIONS'
      });
    }

    // Überprüfe zusätzliche Berechtigungen basierend auf der Rolle
    if (req.user.role === 'doctor' && req.user.doctorId) {
      // Spezielle Prüfungen für Ärzte
      if (req.params.doctorId && req.params.doctorId !== req.user.doctorId) {
        return res.status(403).json({
          message: 'Keine Berechtigung für diesen Arzt',
          code: 'AUTH_DOCTOR_MISMATCH'
        });
      }
    }

    if (req.user.role === 'patient' && req.user.patientId) {
      // Spezielle Prüfungen für Patienten
      if (req.params.patientId && req.params.patientId !== req.user.patientId) {
        return res.status(403).json({
          message: 'Keine Berechtigung für diesen Patienten',
          code: 'AUTH_PATIENT_MISMATCH'
        });
      }
    }

    next();
  };
};

// TypeScript Interface Erweiterung für Request
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
} 