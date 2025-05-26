import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app';
import { Appointment } from '../../src/models/appointment.model';
import { Doctor } from '../../src/models/doctor.model';
import { Patient } from '../../src/models/patient.model';
import { User } from '../../src/models/user.model';
import { generateToken } from '../../src/utils/jwt';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Appointment Integration Tests', () => {
  let patientToken: string;
  let doctorToken: string;
  let adminToken: string;
  let patientId: string;
  let doctorId: string;
  let appointmentId: string;

  beforeAll(async () => {
    // Test-Daten erstellen
    const patient = await Patient.create({
      firstName: 'Test',
      lastName: 'Patient',
      email: 'test.patient@example.com',
      password: 'password123',
      role: 'patient'
    });

    const doctor = await Doctor.create({
      firstName: 'Test',
      lastName: 'Doctor',
      email: 'test.doctor@example.com',
      password: 'password123',
      role: 'doctor',
      specialization: 'Allgemeinmedizin',
      licenseNumber: '12345'
    });

    const admin = await User.create({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test.admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    patientId = patient._id.toString();
    doctorId = doctor._id.toString();

    // Tokens generieren
    patientToken = generateToken(patient);
    doctorToken = generateToken(doctor);
    adminToken = generateToken(admin);
  });

  afterAll(async () => {
    // Test-Daten aufräumen
    await Appointment.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test: Termin erstellen
  describe('POST /api/appointments', () => {
    it('sollte einen Termin erstellen', async () => {
      const appointmentData = {
        date: new Date('2024-03-15'),
        time: '10:00',
        duration: 30,
        doctorId,
        description: 'Routineuntersuchung'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.doctorId.toString()).toBe(doctorId);
      expect(response.body.data.patientId.toString()).toBe(patientId);

      appointmentId = response.body.data._id;
    });

    it('sollte einen Fehler zurückgeben, wenn der Termin nicht verfügbar ist', async () => {
      const appointmentData = {
        date: new Date('2024-03-15'),
        time: '10:00',
        duration: 30,
        doctorId,
        description: 'Routineuntersuchung'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(appointmentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Der gewünschte Termin ist nicht verfügbar');
    });
  });

  // Test: Termin nach ID abrufen
  describe('GET /api/appointments/:id', () => {
    it('sollte einen Termin nach ID abrufen', async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(appointmentId);
    });

    it('sollte einen Fehler zurückgeben, wenn der Termin nicht gefunden wird', async () => {
      const response = await request(app)
        .get(`/api/appointments/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Termin nicht gefunden');
    });
  });

  // Test: Termine nach Arzt abrufen
  describe('GET /api/appointments/doctor/:doctorId', () => {
    it('sollte Termine nach Arzt abrufen', async () => {
      const response = await request(app)
        .get(`/api/appointments/doctor/${doctorId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].doctorId.toString()).toBe(doctorId);
    });
  });

  // Test: Termine nach Patient abrufen
  describe('GET /api/appointments/patient', () => {
    it('sollte Termine nach Patient abrufen', async () => {
      const response = await request(app)
        .get('/api/appointments/patient')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].patientId.toString()).toBe(patientId);
    });
  });

  // Test: Termine nach Datum abrufen
  describe('GET /api/appointments/date/:date', () => {
    it('sollte Termine nach Datum abrufen', async () => {
      const response = await request(app)
        .get('/api/appointments/date/2024-03-15')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // Test: Termine nach Status abrufen
  describe('GET /api/appointments/status/:status', () => {
    it('sollte Termine nach Status abrufen', async () => {
      const response = await request(app)
        .get('/api/appointments/status/scheduled')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].status).toBe('scheduled');
    });
  });

  // Test: Termin aktualisieren
  describe('PATCH /api/appointments/:id', () => {
    it('sollte einen Termin aktualisieren', async () => {
      const updateData = {
        description: 'Aktualisierte Routineuntersuchung',
        notes: 'Patient hat leichte Beschwerden'
      };

      const response = await request(app)
        .patch(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.notes).toBe(updateData.notes);
    });
  });

  // Test: Terminstatus aktualisieren
  describe('PATCH /api/appointments/:id/status', () => {
    it('sollte den Terminstatus aktualisieren', async () => {
      const response = await request(app)
        .patch(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  // Test: Termin löschen
  describe('DELETE /api/appointments/:id', () => {
    it('sollte einen Termin löschen', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Termin erfolgreich gelöscht');
    });
  });

  // Test: Verfügbarkeit prüfen
  describe('POST /api/appointments/check-availability', () => {
    it('sollte die Verfügbarkeit eines Termins prüfen', async () => {
      const checkData = {
        doctorId,
        date: '2024-03-15',
        time: '14:00',
        duration: 30
      };

      const response = await request(app)
        .post('/api/appointments/check-availability')
        .send(checkData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isAvailable');
    });
  });
}); 