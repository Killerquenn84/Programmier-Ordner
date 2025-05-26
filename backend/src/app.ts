import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { auditLogMiddleware } from './utils/auditLogger';
import { encryptionMiddleware } from './utils/encryption';
import appointmentRoutes from './routes/appointments';
import authRoutes from './routes/auth';
import { config } from './config';
import userRoutes from './modules/user/user.routes';
import patientRoutes from './modules/patient/patient.routes';

// Umgebungsvariablen laden
dotenv.config();

const app = express();

// Grundlegende Sicherheitsmaßnahmen
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));

// CORS-Konfiguration
app.use(cors({
  origin: config.corsOrigin
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax
});
app.use(limiter);

// Body Parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Verschlüsselung für sensible Daten
app.use(encryptionMiddleware([
  'email',
  'phoneNumber',
  'address',
  'notes',
  'diagnosis',
  'prescription',
  'insuranceNumber'
]));

// Audit-Logging für alle Routen
app.use(auditLogMiddleware('SYSTEM'));

// Routes werden hier importiert und registriert
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);

// Datenbankverbindung
mongoose.connect(config.mongoUri)
  .then(() => console.log('MongoDB verbunden'))
  .catch(err => console.error('MongoDB Verbindungsfehler:', err));

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Ein interner Serverfehler ist aufgetreten',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app; 