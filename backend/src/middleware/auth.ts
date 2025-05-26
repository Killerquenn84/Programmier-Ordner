import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import userService from '../modules/user/user.service';

export interface TokenPayload {
  userId: string;
  role: string;
  sessionId: string;
}

// Erweitere die Express Request-Schnittstelle
declare global {
  namespace Express {
    interface Request {
      doctor?: any;
    }
  }
}

// JWT Secret aus Umgebungsvariablen
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware zur Überprüfung des JWT-Tokens
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Token aus dem Authorization-Header extrahieren
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Keine Authentifizierung' });
    }

    // Token verifizieren
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Arzt aus der Datenbank holen
    const doctor = await Doctor.findById(decoded.id);
    
    if (!doctor) {
      return res.status(401).json({ message: 'Arzt nicht gefunden' });
    }

    // Arzt zum Request hinzufügen
    req.doctor = doctor;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Bitte authentifizieren' });
  }
};

// Funktion zum Generieren eines JWT-Tokens
export const generateToken = (doctorId: string): string => {
  return jwt.sign({ id: doctorId }, JWT_SECRET, { expiresIn: '24h' });
};

// Token verifizieren
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        code: 'AUTH_NO_TOKEN',
        message: 'Kein Token vorhanden'
      });
    }

    const payload = await userService.verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 'AUTH_INVALID_TOKEN',
      message: 'Ungültiger Token'
    });
  }
};

// Rollenprüfung
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        code: 'AUTH_NOT_AUTHENTICATED',
        message: 'Nicht authentifiziert'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        code: 'AUTH_INSUFFICIENT_PERMISSIONS',
        message: 'Keine ausreichenden Berechtigungen'
      });
    }

    next();
  };
};

// Admin-Rolle prüfen
export const isAdmin = checkRole(['admin']);

// Arzt-Rolle prüfen
export const isDoctor = checkRole(['admin', 'doctor']);

// Patient-Rolle prüfen
export const isPatient = checkRole(['admin', 'doctor', 'patient']); 