import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Konfiguration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Verschlüsselungsdienst
export class EncryptionService {
  private static instance: EncryptionService;
  private masterKey: Buffer;

  private constructor() {
    // Master-Key aus Umgebungsvariablen oder generieren
    const masterKeyString = process.env.ENCRYPTION_KEY;
    if (!masterKeyString) {
      throw new Error('ENCRYPTION_KEY muss in den Umgebungsvariablen definiert sein');
    }
    this.masterKey = Buffer.from(masterKeyString, 'hex');
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Verschlüsselt einen String
  public encrypt(text: string): string {
    try {
      // Initialisierungsvektor generieren
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Salt generieren
      const salt = crypto.randomBytes(SALT_LENGTH);
      
      // Schlüssel ableiten
      const key = crypto.pbkdf2Sync(this.masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
      
      // Verschlüsselung
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      
      // Auth-Tag extrahieren
      const tag = cipher.getAuthTag();
      
      // Alles zusammenführen
      const result = Buffer.concat([salt, iv, tag, encrypted]);
      
      return result.toString('base64');
    } catch (error) {
      console.error('Verschlüsselungsfehler:', error);
      throw new Error('Verschlüsselung fehlgeschlagen');
    }
  }

  // Entschlüsselt einen String
  public decrypt(encryptedText: string): string {
    try {
      // Base64-Dekodierung
      const buffer = Buffer.from(encryptedText, 'base64');
      
      // Komponenten extrahieren
      const salt = buffer.slice(0, SALT_LENGTH);
      const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      
      // Schlüssel ableiten
      const key = crypto.pbkdf2Sync(this.masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
      
      // Entschlüsselung
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Entschlüsselungsfehler:', error);
      throw new Error('Entschlüsselung fehlgeschlagen');
    }
  }

  // Verschlüsselt ein Objekt
  public encryptObject<T>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  // Entschlüsselt ein Objekt
  public decryptObject<T>(encryptedText: string): T {
    return JSON.parse(this.decrypt(encryptedText)) as T;
  }

  // Generiert einen sicheren Hash
  public hash(text: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(text, salt, ITERATIONS, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Überprüft einen Hash
  public verifyHash(text: string, hash: string): boolean {
    const [salt, storedHash] = hash.split(':');
    const computedHash = crypto.pbkdf2Sync(text, salt, ITERATIONS, 64, 'sha512').toString('hex');
    return storedHash === computedHash;
  }

  // Generiert einen sicheren Schlüssel
  public generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Middleware für automatische Verschlüsselung/Entschlüsselung
export const encryptionMiddleware = (fields: string[]) => {
  const encryptionService = EncryptionService.getInstance();

  return (req: Request, res: Response, next: NextFunction) => {
    // Verschlüsselung der Anfrage
    if (req.body) {
      for (const field of fields) {
        if (req.body[field]) {
          req.body[field] = encryptionService.encrypt(req.body[field]);
        }
      }
    }

    // Entschlüsselung der Antwort
    const originalJson = res.json;
    res.json = function(body: any): Response {
      if (body) {
        for (const field of fields) {
          if (body[field]) {
            body[field] = encryptionService.decrypt(body[field]);
          }
        }
      }
      return originalJson.call(this, body);
    };

    next();
  };
}; 