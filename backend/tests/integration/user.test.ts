import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/modules/user/user.model';
import { CreateUserDto } from '../../src/modules/user/user.service';

describe('User Integration Tests', () => {
  let adminToken: string;
  let patientToken: string;
  let doctorToken: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    // Admin-Benutzer erstellen
    const adminData: CreateUserDto = {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    };
    const adminResponse = await request(app)
      .post('/api/users/register')
      .send(adminData);
    adminToken = adminResponse.body.token;

    // Patient-Benutzer erstellen
    const patientData: CreateUserDto = {
      email: 'patient@example.com',
      password: 'patient123',
      role: 'patient',
      firstName: 'Max',
      lastName: 'Mustermann'
    };
    const patientResponse = await request(app)
      .post('/api/users/register')
      .send(patientData);
    patientToken = patientResponse.body.token;

    // Arzt-Benutzer erstellen
    const doctorData: CreateUserDto = {
      email: 'doctor@example.com',
      password: 'doctor123',
      role: 'doctor',
      firstName: 'Dr.',
      lastName: 'Medicus'
    };
    const doctorResponse = await request(app)
      .post('/api/users/register')
      .send(doctorData);
    doctorToken = doctorResponse.body.token;
  });

  describe('Benutzerregistrierung', () => {
    it('sollte einen neuen Benutzer registrieren', async () => {
      const userData: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
    });

    it('sollte einen Fehler bei doppelter E-Mail werfen', async () => {
      const userData: CreateUserDto = {
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Duplicate',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('Benutzeranmeldung', () => {
    it('sollte einen Benutzer erfolgreich anmelden', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'patient@example.com',
          password: 'patient123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('sollte einen Fehler bei falschen Anmeldedaten werfen', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'patient@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Profilverwaltung', () => {
    it('sollte das eigene Profil abrufen können', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('patient@example.com');
    });

    it('sollte das eigene Profil aktualisieren können', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.firstName).toBe('Updated');
      expect(response.body.user.lastName).toBe('Name');
    });
  });

  describe('Admin-Funktionen', () => {
    it('sollte alle Benutzer abrufen können (nur Admin)', async () => {
      const response = await request(app)
        .get('/api/users/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('sollte einen Benutzer deaktivieren können (nur Admin)', async () => {
      const response = await request(app)
        .put('/api/users/users/patient@example.com/deactivate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.isActive).toBe(false);
    });

    it('sollte keinen Zugriff auf Admin-Funktionen ohne Admin-Rolle haben', async () => {
      const response = await request(app)
        .get('/api/users/users')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 