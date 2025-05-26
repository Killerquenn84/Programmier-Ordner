import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Konfiguration für die Verschlüsselung
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';

// Hilfsfunktionen für die Verschlüsselung
const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Kombiniere IV, verschlüsselten Text und Auth-Tag
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
};

const decrypt = (text: string): string => {
  const [ivHex, encrypted, authTagHex] = text.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Middleware für die Verschlüsselung sensibler Daten
export const encryptSensitiveData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      fields.forEach(field => {
        if (req.body[field]) {
          req.body[field] = encrypt(req.body[field]);
        }
      });
    }
    next();
  };
};

// Middleware für die Entschlüsselung sensibler Daten
export const decryptSensitiveData = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      fields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string' && req.body[field].includes(':')) {
          try {
            req.body[field] = decrypt(req.body[field]);
          } catch (error) {
            console.error(`Fehler beim Entschlüsseln von ${field}:`, error);
          }
        }
      });
    }
    next();
  };
};

// Middleware für die Verschlüsselung der Antwort
export const encryptResponse = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function(data: any) {
      if (data) {
        fields.forEach(field => {
          if (data[field]) {
            data[field] = encrypt(data[field]);
          }
        });
      }
      return originalJson.call(this, data);
    };
    next();
  };
};

// Middleware für die Entschlüsselung der Anfrage
export const decryptRequest = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      fields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string' && req.body[field].includes(':')) {
          try {
            req.body[field] = decrypt(req.body[field]);
          } catch (error) {
            console.error(`Fehler beim Entschlüsseln von ${field}:`, error);
          }
        }
      });
    }
    next();
  };
};

// Verschlüsselung für spezifische Datenbankfelder
export const encryptDatabaseFields = (data: any, fields: string[]): any => {
  const encryptedData = { ...data };
  fields.forEach(field => {
    if (encryptedData[field]) {
      encryptedData[field] = encrypt(encryptedData[field]);
    }
  });
  return encryptedData;
};

// Entschlüsselung für spezifische Datenbankfelder
export const decryptDatabaseFields = (data: any, fields: string[]): any => {
  const decryptedData = { ...data };
  fields.forEach(field => {
    if (decryptedData[field] && typeof decryptedData[field] === 'string' && decryptedData[field].includes(':')) {
      try {
        decryptedData[field] = decrypt(decryptedData[field]);
      } catch (error) {
        console.error(`Fehler beim Entschlüsseln von ${field}:`, error);
      }
    }
  });
  return decryptedData;
};

// Verschlüsselung für Arrays von Objekten
export const encryptArray = (array: any[], fields: string[]): any[] => {
  return array.map(item => encryptDatabaseFields(item, fields));
};

// Entschlüsselung für Arrays von Objekten
export const decryptArray = (array: any[], fields: string[]): any[] => {
  return array.map(item => decryptDatabaseFields(item, fields));
};

export default {
  encrypt,
  decrypt,
  encryptSensitiveData,
  decryptSensitiveData,
  encryptResponse,
  decryptRequest,
  encryptDatabaseFields,
  decryptDatabaseFields,
  encryptArray,
  decryptArray
}; 