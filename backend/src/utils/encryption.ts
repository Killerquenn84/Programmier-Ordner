import crypto from 'crypto';
import { config } from '../config';
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
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 64;
  private tagLength = 16;
  private iterations = 100000;

  constructor() {
    if (!config.encryptionKey) {
      throw new Error('Encryption key is not configured');
    }
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.iterations,
      this.keyLength,
      'sha512'
    );
  }

  // Verschlüsselt einen String
  public encrypt(text: string): string {
    try {
      // Generiere Salt und IV
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);

      // Leite Schlüssel ab
      const key = this.deriveKey(config.encryptionKey, salt);

      // Erstelle Cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;

      // Verschlüssele Text
      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
      ]);

      // Hole Auth Tag
      const tag = cipher.getAuthTag();

      // Kombiniere alle Komponenten
      const result = Buffer.concat([
        salt,
        iv,
        tag,
        encrypted
      ]);

      return result.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Entschlüsselt einen String
  public decrypt(encryptedText: string): string {
    try {
      // Konvertiere Base64 zurück zu Buffer
      const buffer = Buffer.from(encryptedText, 'base64');

      // Extrahiere Komponenten
      const salt = buffer.subarray(0, this.saltLength);
      const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
      const tag = buffer.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.tagLength
      );
      const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

      // Leite Schlüssel ab
      const key = this.deriveKey(config.encryptionKey, salt);

      // Erstelle Decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(tag);

      // Entschlüssele Text
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const salt = crypto.randomBytes(16);
    return crypto.pbkdf2Sync(text, salt, this.iterations, 64, 'sha512').toString('hex');
  }

  // Überprüft einen Hash
  public verifyHash(text: string, hash: string): boolean {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const verifyHash = crypto.pbkdf2Sync(text, salt, this.iterations, 64, 'sha512').toString('hex');
    return verifyHash === hashHex;
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