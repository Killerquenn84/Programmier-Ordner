import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../utils/encryption';

const encryptionService = EncryptionService.getInstance();

// Liste der zu verschlüsselnden Felder
const ENCRYPTED_FIELDS = [
  'email',
  'phoneNumber',
  'address',
  'notes',
  'diagnosis',
  'prescription',
  'insuranceNumber',
  'licenseNumber',
  'password',
  'dateOfBirth',
  'gender'
];

// Verschlüsselt sensible Daten in der Anfrage
export const encryptRequestData = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body) {
      encryptObject(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Entschlüsselt sensible Daten in der Antwort
export const decryptResponseData = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function(data: any) {
    if (data) {
      decryptObject(data);
    }
    return originalJson.call(this, data);
  };
  next();
};

// Rekursive Funktion zum Verschlüsseln von Objekten
function encryptObject(obj: any) {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (ENCRYPTED_FIELDS.includes(key) && typeof obj[key] === 'string') {
      obj[key] = encryptionService.encrypt(obj[key]);
    } else if (typeof obj[key] === 'object') {
      encryptObject(obj[key]);
    }
  }
}

// Rekursive Funktion zum Entschlüsseln von Objekten
function decryptObject(obj: any) {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (ENCRYPTED_FIELDS.includes(key) && typeof obj[key] === 'string') {
      try {
        obj[key] = encryptionService.decrypt(obj[key]);
      } catch (error) {
        // Wenn die Entschlüsselung fehlschlägt, lassen wir den Wert unverändert
        console.warn(`Entschlüsselung fehlgeschlagen für Feld ${key}`);
      }
    } else if (typeof obj[key] === 'object') {
      decryptObject(obj[key]);
    }
  }
}

// Middleware für die Verschlüsselung von Datenbankabfragen
export const encryptDatabaseQuery = (req: Request, res: Response, next: NextFunction) => {
  if (req.query) {
    for (const key in req.query) {
      if (ENCRYPTED_FIELDS.includes(key) && typeof req.query[key] === 'string') {
        req.query[key] = encryptionService.encrypt(req.query[key] as string);
      }
    }
  }
  next();
};

// Middleware für die Verschlüsselung von URL-Parametern
export const encryptUrlParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.params) {
    for (const key in req.params) {
      if (ENCRYPTED_FIELDS.includes(key) && typeof req.params[key] === 'string') {
        req.params[key] = encryptionService.encrypt(req.params[key]);
      }
    }
  }
  next();
}; 