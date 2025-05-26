import dotenv from 'dotenv';

// Lade Umgebungsvariablen aus .env Datei
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Datenbank
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-appointment-system',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // E-Mail
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,

  // SMS (Twilio)
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,

  // WhatsApp
  whatsappPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
  whatsappApiKey: process.env.WHATSAPP_API_KEY,

  // Verschlüsselung
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  encryptionIv: process.env.ENCRYPTION_IV || 'your-encryption-iv',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Sicherheit
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindow: 15 * 60 * 1000, // 15 Minuten
  rateLimitMax: 100, // Maximal 100 Anfragen pro Fenster

  // Audit Log
  auditLogPath: process.env.AUDIT_LOG_PATH || './logs/audit.log',

  // Benachrichtigungen
  notificationPreferences: {
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
      reminderHours: parseInt(process.env.EMAIL_REMINDER_HOURS || '24')
    },
    sms: {
      enabled: process.env.SMS_NOTIFICATIONS_ENABLED === 'true',
      reminderHours: parseInt(process.env.SMS_REMINDER_HOURS || '12')
    },
    whatsapp: {
      enabled: process.env.WHATSAPP_NOTIFICATIONS_ENABLED === 'true',
      reminderHours: parseInt(process.env.WHATSAPP_REMINDER_HOURS || '6')
    }
  }
}; 