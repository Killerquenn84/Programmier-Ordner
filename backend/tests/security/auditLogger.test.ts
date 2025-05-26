import { Request, Response, NextFunction } from 'express';
import { AuditLogger, IAuditLog, auditLogMiddleware } from '../../src/utils/auditLogger';
import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Audit Logger Tests', () => {
  let auditLogger: AuditLogger;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNextFn: jest.Mock;

  beforeEach(() => {
    auditLogger = AuditLogger.getInstance();
    mockReq = {
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent'
      },
      user: {
        userId: 'test-user',
        role: 'admin',
        sessionId: 'test-session'
      }
    };
    mockRes = {
      statusCode: 200,
      locals: {}
    };
    mockNextFn = jest.fn();
  });

  afterEach(async () => {
    // Lösche alle Audit-Logs nach jedem Test
    await mongoose.connection.collections['auditlogs']?.deleteMany({});
  });

  // Test: Audit-Log erstellen
  it('sollte einen Audit-Log erstellen', async () => {
    await auditLogger.log(
      mockReq as Request,
      'CREATE',
      'APPOINTMENT',
      '123',
      { message: 'Test log entry' }
    );

    const logs = await mongoose.connection.collections['auditlogs']?.find({}).toArray();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.userId).toBe('test-user');
    expect(log.userRole).toBe('admin');
    expect(log.action).toBe('CREATE');
    expect(log.resourceType).toBe('APPOINTMENT');
    expect(log.resourceId).toBe('123');
    expect(log.details.message).toBe('Test log entry');
    expect(log.ipAddress).toBe('127.0.0.1');
    expect(log.userAgent).toBe('test-agent');
  });

  // Test: Zugriffs-Log erstellen
  it('sollte einen Zugriffs-Log erstellen', async () => {
    await auditLogger.logAccess(
      mockReq as Request,
      'APPOINTMENT',
      '123'
    );

    const logs = await mongoose.connection.collections['auditlogs']?.find({}).toArray();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.action).toBe('READ');
    expect(log.resourceType).toBe('APPOINTMENT');
    expect(log.resourceId).toBe('123');
  });

  // Test: Änderungs-Log erstellen
  it('sollte einen Änderungs-Log erstellen', async () => {
    const oldData = { name: 'old' };
    const newData = { name: 'new' };

    await auditLogger.logModification(
      mockReq as Request,
      'APPOINTMENT',
      '123',
      oldData,
      newData
    );

    const logs = await mongoose.connection.collections['auditlogs']?.find({}).toArray();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.action).toBe('UPDATE');
    expect(log.details.oldData).toEqual(oldData);
    expect(log.details.newData).toEqual(newData);
    expect(log.details.changes).toBeDefined();
  });

  // Test: Erstellungs-Log erstellen
  it('sollte einen Erstellungs-Log erstellen', async () => {
    const data = { name: 'test' };

    await auditLogger.logCreation(
      mockReq as Request,
      'APPOINTMENT',
      '123',
      data
    );

    const logs = await mongoose.connection.collections['auditlogs']?.find({}).toArray();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.action).toBe('CREATE');
    expect(log.details.data).toEqual(data);
  });

  // Test: Löschungs-Log erstellen
  it('sollte einen Löschungs-Log erstellen', async () => {
    const data = { name: 'test' };

    await auditLogger.logDeletion(
      mockReq as Request,
      'APPOINTMENT',
      '123',
      data
    );

    const logs = await mongoose.connection.collections['auditlogs']?.find({}).toArray();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.action).toBe('DELETE');
    expect(log.details.data).toEqual(data);
  });

  // Test: Fehler-Log erstellen
  it('sollte einen Fehler-Log erstellen', async () => {
    const error = new Error('Test error');

    await auditLogger.logError(
      mockReq as Request,
      'APPOINTMENT',
      '123',
      error
    );

    const logs = await mongoose.connection.collections['auditlogs']?.find({}).toArray();
    expect(logs).toHaveLength(1);
    const log = logs[0];
    expect(log.action).toBe('ERROR');
    expect(log.errorMessage).toBe(error.message);
    expect(log.details.error).toBe(error.message);
    expect(log.details.stack).toBe(error.stack);
  });

  // Test: Middleware-Funktionalität
  it('sollte die Middleware korrekt ausführen', () => {
    const middleware = auditLogMiddleware('APPOINTMENT');
    middleware(mockReq as Request, mockRes as Response, mockNextFn);

    expect(mockNextFn).toHaveBeenCalled();
  });
}); 