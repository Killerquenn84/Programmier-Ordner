import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

// Redis-Client für verteiltes Rate-Limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Allgemeiner Rate-Limiter für alle Routen
export const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Maximal 100 Anfragen pro IP in 15 Minuten
  message: 'Zu viele Anfragen von dieser IP. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false
});

// Strikterer Rate-Limiter für Authentifizierungsendpunkte
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 Stunde
  max: 5, // Maximal 5 fehlgeschlagene Anmeldeversuche pro IP in 1 Stunde
  message: 'Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false
});

// Spezieller Rate-Limiter für API-Endpunkte
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:api:'
  }),
  windowMs: 60 * 1000, // 1 Minute
  max: 60, // Maximal 60 Anfragen pro IP in 1 Minute
  message: 'Zu viele API-Anfragen. Bitte versuchen Sie es später erneut.',
  standardHeaders: true,
  legacyHeaders: false
});

// Dynamischer Rate-Limiter basierend auf Benutzerrolle
export const dynamicLimiter = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  const limits = {
    admin: {
      windowMs: 60 * 1000, // 1 Minute
      max: 100 // 100 Anfragen pro Minute
    },
    doctor: {
      windowMs: 60 * 1000,
      max: 50 // 50 Anfragen pro Minute
    },
    patient: {
      windowMs: 60 * 1000,
      max: 20 // 20 Anfragen pro Minute
    },
    default: {
      windowMs: 60 * 1000,
      max: 10 // 10 Anfragen pro Minute
    }
  };

  const limit = limits[userRole as keyof typeof limits] || limits.default;

  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: `rate-limit:${userRole || 'default'}:`
    }),
    windowMs: limit.windowMs,
    max: limit.max,
    message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
    standardHeaders: true,
    legacyHeaders: false
  })(req, res, next);
};

// Wrapper für benutzerdefinierte Rate-Limiter
export const createCustomLimiter = (options: {
  windowMs: number;
  max: number;
  prefix: string;
  message?: string;
}) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: `rate-limit:${options.prefix}:`
    }),
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.',
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Middleware zum Zurücksetzen des Rate-Limiters nach erfolgreicher Authentifizierung
export const resetAuthLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    const key = `rate-limit:auth:${req.ip}`;
    redis.del(key);
  }
  next();
};

// Fehlerbehandlung für Redis-Verbindung
redis.on('error', (error) => {
  console.error('Redis-Verbindungsfehler:', error);
  // Fallback auf In-Memory-Speicher wenn Redis nicht verfügbar
  process.env.USE_MEMORY_STORE = 'true';
});

export default {
  generalLimiter,
  authLimiter,
  apiLimiter,
  dynamicLimiter,
  createCustomLimiter,
  resetAuthLimiter
}; 