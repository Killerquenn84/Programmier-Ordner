import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { format } from 'winston';

// Winston Logger Konfiguration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'arztpraxis-api' },
  transports: [
    // Konsolen-Transport
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    // Datei-Transport für alle Logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Request-Logging Middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Logging nach Abschluss der Anfrage
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 500) {
      logger.error(message, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
    } else if (res.statusCode >= 400) {
      logger.warn(message, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        ip: req.ip
      });
    } else {
      logger.info(message, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration
      });
    }
  });

  next();
};

// Error-Logging Middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unbehandelter Fehler:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  next(err);
};

// Performance-Logging Middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    if (duration > 1000) { // Log wenn Anfrage länger als 1 Sekunde dauert
      logger.warn('Langsame Anfrage erkannt:', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip
      });
    }
  });

  next();
};

// Security-Logging Middleware
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Logging für potenziell verdächtige Anfragen
  const suspiciousPatterns = [
    /\.\.\//, // Directory Traversal
    /<script>/, // XSS
    /exec\(/, // Command Injection
    /union\s+select/i, // SQL Injection
    /eval\(/ // Code Injection
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.originalUrl) || 
    pattern.test(JSON.stringify(req.body))
  );

  if (isSuspicious) {
    logger.warn('Verdächtige Anfrage erkannt:', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  next();
};

// Audit-Logging Middleware
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  // Logging für wichtige Aktionen
  const auditEndpoints = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/patients',
    '/api/appointments'
  ];

  if (auditEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint))) {
    logger.info('Audit-Log:', {
      method: req.method,
      url: req.originalUrl,
      user: req.user?.id,
      action: req.method,
      resource: req.originalUrl.split('/')[2],
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Custom Logger für spezifische Events
export const eventLogger = {
  log: (event: string, data: any) => {
    logger.info(`Event: ${event}`, data);
  },
  error: (event: string, error: Error) => {
    logger.error(`Event Error: ${event}`, {
      error: error.message,
      stack: error.stack
    });
  },
  warn: (event: string, data: any) => {
    logger.warn(`Event Warning: ${event}`, data);
  }
};

export default {
  logger,
  requestLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  auditLogger,
  eventLogger
}; 