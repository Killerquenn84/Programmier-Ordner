import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Lade Test-Umgebungsvariablen
dotenv.config({ path: '.env.test' });

let mongoServer: MongoMemoryServer;

// Vor allen Tests
beforeAll(async () => {
  // Starte MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Verbinde mit MongoDB Memory Server
  await mongoose.connect(mongoUri);
});

// Nach allen Tests
afterAll(async () => {
  // Trenne Verbindung zur MongoDB
  await mongoose.disconnect();
  // Stoppe MongoDB Memory Server
  await mongoServer.stop();
});

// Vor jedem Test
beforeEach(async () => {
  // Lösche alle Daten aus der Datenbank
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Nach jedem Test
afterEach(async () => {
  // Lösche alle Daten aus der Datenbank
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock für JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation((payload) => {
    return 'test-token-' + JSON.stringify(payload);
  }),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'test-token') {
      return {
        userId: 'test-user-id',
        role: 'admin',
        sessionId: 'test-session'
      };
    }
    throw new Error('Ungültiger Token');
  })
}));

// Mock für E-Mail-Versand
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendAppointmentConfirmation: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendAppointmentReminder: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendAppointmentCancellation: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendPasswordReset: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendWelcomeEmail: jest.fn().mockImplementation(() => Promise.resolve(true))
}));

// Mock für SMS-Versand
jest.mock('../src/services/smsService', () => ({
  sendSMS: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendAppointmentConfirmationSMS: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendAppointmentReminderSMS: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendAppointmentCancellationSMS: jest.fn().mockImplementation(() => Promise.resolve(true)),
  sendVerificationCode: jest.fn().mockImplementation(() => Promise.resolve(true))
}));

// Hilfsfunktionen für Tests
export const createTestUser = async (User: any, role: string = 'patient') => {
  return await User.create({
    email: 'test@example.com',
    password: 'password123',
    role,
    firstName: 'Test',
    lastName: 'User'
  });
};

export const createTestDoctor = async (Doctor: any) => {
  return await Doctor.create({
    userId: 'test-user-id',
    specialization: 'Allgemeinmedizin',
    licenseNumber: '12345'
  });
};

export const createTestPatient = async (Patient: any) => {
  return await Patient.create({
    userId: 'test-user-id',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'm',
    address: {
      street: 'Teststraße',
      number: '1',
      city: 'Teststadt',
      postalCode: '12345'
    }
  });
};

export const createTestAppointment = async (Appointment: any, doctorId: string, patientId: string) => {
  return await Appointment.create({
    doctorId,
    patientId,
    date: new Date(),
    time: '10:00',
    duration: 30,
    status: 'scheduled',
    description: 'Test Termin'
  });
};

// Setze Umgebungsvariablen für Tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long!!';
process.env.EMAIL_FROM = 'test@example.com';
process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test-user';
process.env.SMTP_PASS = 'test-pass';
process.env.SMS_FROM = 'TestApp';
process.env.TWILIO_ACCOUNT_SID = 'test-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '100';
process.env.LOG_LEVEL = 'error';
process.env.LOG_FILE = 'logs/test.log';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.COOKIE_SECRET = 'test-cookie-secret';
process.env.COOKIE_MAX_AGE = '86400000';
process.env.API_VERSION = 'v1';
process.env.API_PREFIX = '/api';

// Mock-Funktionen für Express
export const mockRequest = () => {
  const req: any = {
    headers: {},
    user: undefined,
    params: {},
    query: {},
    body: {}
  };
  return req;
};

export const mockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    locals: {}
  };
  return res;
};

export const mockNext = () => {
  return jest.fn();
};

// Hilfsfunktionen für Tests
export const createMockRequest = (data: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...data
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn(); 