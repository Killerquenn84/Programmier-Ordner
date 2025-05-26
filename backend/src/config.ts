import dotenv from 'dotenv';

// Lade Umgebungsvariablen aus .env Datei
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Datenbank
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // E-Mail
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,

  // Verschlüsselung
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  encryptionIv: process.env.ENCRYPTION_IV || 'your-encryption-iv',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Sicherheit
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15 Minuten
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 Anfragen pro Fenster
}; 