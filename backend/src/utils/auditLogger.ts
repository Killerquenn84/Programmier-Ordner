import mongoose, { Schema, Document } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

// Audit-Log Schema
export interface IAuditLog extends Document {
  timestamp: Date;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

const auditLogSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'IMPORT',
      'ACCESS_DENIED',
      'ERROR'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: [
      'APPOINTMENT',
      'PATIENT',
      'DOCTOR',
      'USER',
      'SYSTEM'
    ]
  },
  resourceId: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indizes für schnelle Abfragen
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

// Audit-Logger Klasse
export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Hauptmethode zum Erstellen von Audit-Logs
  public async log(
    req: Request,
    action: IAuditLog['action'],
    resourceType: IAuditLog['resourceType'],
    resourceId: string,
    details: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      const user = req.user;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const auditLog = new AuditLog({
        userId: user?.userId || 'anonymous',
        userRole: user?.role || 'anonymous',
        action,
        resourceType,
        resourceId,
        details,
        ipAddress,
        userAgent,
        success,
        errorMessage
      });

      await auditLog.save();
    } catch (error) {
      console.error('Fehler beim Erstellen des Audit-Logs:', error);
      // Hier könnte man einen Fallback-Mechanismus implementieren
    }
  }

  // Hilfsmethoden für häufige Aktionen
  public async logAccess(req: Request, resourceType: string, resourceId: string, success: boolean = true): Promise<void> {
    await this.log(req, 'READ', resourceType as IAuditLog['resourceType'], resourceId, {}, success);
  }

  public async logModification(
    req: Request,
    resourceType: string,
    resourceId: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    success: boolean = true
  ): Promise<void> {
    const details = {
      oldData,
      newData,
      changes: this.calculateChanges(oldData, newData)
    };
    await this.log(req, 'UPDATE', resourceType as IAuditLog['resourceType'], resourceId, details, success);
  }

  public async logCreation(
    req: Request,
    resourceType: string,
    resourceId: string,
    data: Record<string, any>,
    success: boolean = true
  ): Promise<void> {
    await this.log(req, 'CREATE', resourceType as IAuditLog['resourceType'], resourceId, { data }, success);
  }

  public async logDeletion(
    req: Request,
    resourceType: string,
    resourceId: string,
    data: Record<string, any>,
    success: boolean = true
  ): Promise<void> {
    await this.log(req, 'DELETE', resourceType as IAuditLog['resourceType'], resourceId, { data }, success);
  }

  public async logError(
    req: Request,
    resourceType: string,
    resourceId: string,
    error: Error,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log(
      req,
      'ERROR',
      resourceType as IAuditLog['resourceType'],
      resourceId,
      { ...details, error: error.message, stack: error.stack },
      false,
      error.message
    );
  }

  // Hilfsmethode zum Berechnen von Änderungen
  private calculateChanges(oldData: Record<string, any>, newData: Record<string, any>): Record<string, any> {
    const changes: Record<string, any> = {};
    
    for (const key in newData) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    }

    return changes;
  }
}

// Middleware für automatisches Audit-Logging
export const auditLogMiddleware = (resourceType: IAuditLog['resourceType']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const logger = AuditLogger.getInstance();

    // Response-Interceptor
    res.send = function(body: any): Response {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const resourceId = req.params.id || 'unknown';

      // Asynchrones Logging
      logger.log(
        req,
        req.method === 'GET' ? 'READ' :
        req.method === 'POST' ? 'CREATE' :
        req.method === 'PUT' || req.method === 'PATCH' ? 'UPDATE' :
        req.method === 'DELETE' ? 'DELETE' : 'READ',
        resourceType,
        resourceId,
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body: req.body
        },
        success
      ).catch(console.error);

      return originalSend.call(this, body);
    };

    next();
  };
}; 