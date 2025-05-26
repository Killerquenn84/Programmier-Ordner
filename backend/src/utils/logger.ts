import winston from 'winston';
import { config } from '../config';
import { EncryptionService } from './encryption';

const encryptionService = EncryptionService.getInstance();

// Verschlüsselt Log-Nachrichten
const encryptMessage = (message: string): string => {
  return encryptionService.encrypt(message);
};

// Erstellt einen verschlüsselten Logger
export const createLogger = (service: string) => {
  return winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports: [
      // Konsolen-Transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      // Datei-Transport mit Verschlüsselung
      new winston.transports.File({
        filename: config.auditLogPath,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf((info) => {
            const message = typeof info.message === 'string' ? info.message : JSON.stringify(info.message);
            const encryptedMessage = encryptMessage(message);
            return JSON.stringify({
              timestamp: info.timestamp,
              level: info.level,
              service: info.service,
              message: encryptedMessage
            });
          })
        )
      })
    ]
  });
}; 