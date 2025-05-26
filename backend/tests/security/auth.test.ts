import { Request, Response } from 'express';
import { generateToken, verifyToken, authenticateToken, checkRole, TokenPayload } from '../../src/utils/auth';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Auth Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNextFn: jest.Mock;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNextFn = jest.fn();
  });

  // Test: Token generieren
  it('sollte einen gültigen Token generieren', () => {
    const payload: TokenPayload = {
      userId: '123',
      role: 'user',
      sessionId: 'test-session'
    };

    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  // Test: Token verifizieren
  it('sollte einen gültigen Token verifizieren', () => {
    const payload: TokenPayload = {
      userId: '123',
      role: 'user',
      sessionId: 'test-session'
    };

    const token = generateToken(payload);
    const verifiedPayload = verifyToken(token);

    expect(verifiedPayload).toBeDefined();
    expect(verifiedPayload.userId).toBe(payload.userId);
    expect(verifiedPayload.role).toBe(payload.role);
  });

  // Test: Authentifizierungs-Middleware
  it('sollte die Authentifizierungs-Middleware korrekt ausführen', () => {
    const payload: TokenPayload = {
      userId: '123',
      role: 'user',
      sessionId: 'test-session'
    };

    const token = generateToken(payload);
    mockReq.headers = {
      authorization: `Bearer ${token}`
    };

    authenticateToken(mockReq as Request, mockRes as Response, mockNextFn);

    expect(mockNextFn).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.userId).toBe(payload.userId);
    expect(mockReq.user?.role).toBe(payload.role);
  });

  // Test: Rollenprüfung
  it('sollte die Rollenprüfung korrekt durchführen', () => {
    const payload: TokenPayload = {
      userId: '123',
      role: 'admin',
      sessionId: 'test-session'
    };

    const token = generateToken(payload);
    mockReq.headers = {
      authorization: `Bearer ${token}`
    };

    authenticateToken(mockReq as Request, mockRes as Response, mockNextFn);
    checkRole(['admin'])(mockReq as Request, mockRes as Response, mockNextFn);

    expect(mockNextFn).toHaveBeenCalled();
  });

  // Test: Ungültige Rolle
  it('sollte bei ungültiger Rolle einen Fehler werfen', () => {
    const payload: TokenPayload = {
      userId: '123',
      role: 'user',
      sessionId: 'test-session'
    };

    const token = generateToken(payload);
    mockReq.headers = {
      authorization: `Bearer ${token}`
    };

    authenticateToken(mockReq as Request, mockRes as Response, mockNextFn);
    checkRole(['admin'])(mockReq as Request, mockRes as Response, mockNextFn);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: 'Keine ausreichenden Berechtigungen'
    });
  });
}); 