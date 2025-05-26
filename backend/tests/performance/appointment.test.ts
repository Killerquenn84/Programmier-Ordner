import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { Appointment } from '../../src/models/appointment.model';
import { generateToken } from '../../src/utils/auth';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Appointment Performance Tests', () => {
  let token: string;

  beforeEach(async () => {
    // Generiere Token für Tests
    token = generateToken({ 
      userId: 'test-user', 
      role: 'admin',
      sessionId: 'test-session'
    });
  });

  afterEach(async () => {
    // Lösche alle Test-Termine
    await Appointment.deleteMany({});
  });

  // Test: Massen-Erstellung von Terminen
  it('sollte 100 Termine schnell erstellen können', async () => {
    const startTime = Date.now();
    const appointments = [];

    for (let i = 0; i < 100; i++) {
      const appointmentData = {
        date: new Date(`2023-03-${15 + i}T10:00:00Z`),
        time: '10:00',
        duration: 30,
        status: 'scheduled',
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId(),
        description: `Routineuntersuchung ${i}`,
        notes: `Patient ${i} hat keine Beschwerden`
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      appointments.push(response.body);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Überprüfe, ob die Erstellung innerhalb von 10 Sekunden abgeschlossen wurde
    expect(duration).toBeLessThan(10000);
    expect(appointments).toHaveLength(100);
  });

  // Test: Schnelle Abfrage vieler Termine
  it('sollte 100 Termine schnell abrufen können', async () => {
    // Erstelle 100 Termine
    const appointments = [];
    for (let i = 0; i < 100; i++) {
      const appointment = new Appointment({
        date: new Date(`2023-03-${15 + i}T10:00:00Z`),
        time: '10:00',
        duration: 30,
        status: 'scheduled',
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId(),
        description: `Routineuntersuchung ${i}`,
        notes: `Patient ${i} hat keine Beschwerden`
      });
      appointments.push(await appointment.save());
    }

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Überprüfe, ob die Abfrage innerhalb von 1 Sekunde abgeschlossen wurde
    expect(duration).toBeLessThan(1000);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(100);
  });

  // Test: Schnelle Filterung von Terminen
  it('sollte Termine schnell nach Datum filtern können', async () => {
    // Erstelle Termine mit verschiedenen Daten
    const appointments = [];
    for (let i = 0; i < 50; i++) {
      const appointment = new Appointment({
        date: new Date(`2023-03-${15 + i}T10:00:00Z`),
        time: '10:00',
        duration: 30,
        status: 'scheduled',
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId(),
        description: `Routineuntersuchung ${i}`,
        notes: `Patient ${i} hat keine Beschwerden`
      });
      appointments.push(await appointment.save());
    }

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/appointments')
      .query({
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2023-03-20T23:59:59Z'
      })
      .set('Authorization', `Bearer ${token}`)
      .send();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Überprüfe, ob die Filterung innerhalb von 500ms abgeschlossen wurde
    expect(duration).toBeLessThan(500);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.length).toBeLessThanOrEqual(50);
  });

  // Test: Schnelle Aktualisierung vieler Termine
  it('sollte 50 Termine schnell aktualisieren können', async () => {
    // Erstelle 50 Termine
    const appointments = [];
    for (let i = 0; i < 50; i++) {
      const appointment = new Appointment({
        date: new Date(`2023-03-${15 + i}T10:00:00Z`),
        time: '10:00',
        duration: 30,
        status: 'scheduled',
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId(),
        description: `Routineuntersuchung ${i}`,
        notes: `Patient ${i} hat keine Beschwerden`
      });
      appointments.push(await appointment.save());
    }

    const startTime = Date.now();

    for (const appointment of appointments) {
      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'completed',
          notes: `Untersuchung ${appointment._id} erfolgreich durchgeführt`
        });

      expect(response.status).toBe(200);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Überprüfe, ob die Aktualisierungen innerhalb von 5 Sekunden abgeschlossen wurden
    expect(duration).toBeLessThan(5000);
  });

  // Test: Schnelle Löschung vieler Termine
  it('sollte 50 Termine schnell löschen können', async () => {
    // Erstelle 50 Termine
    const appointments = [];
    for (let i = 0; i < 50; i++) {
      const appointment = new Appointment({
        date: new Date(`2023-03-${15 + i}T10:00:00Z`),
        time: '10:00',
        duration: 30,
        status: 'scheduled',
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId(),
        description: `Routineuntersuchung ${i}`,
        notes: `Patient ${i} hat keine Beschwerden`
      });
      appointments.push(await appointment.save());
    }

    const startTime = Date.now();

    for (const appointment of appointments) {
      const response = await request(app)
        .delete(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(204);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Überprüfe, ob die Löschungen innerhalb von 5 Sekunden abgeschlossen wurden
    expect(duration).toBeLessThan(5000);

    // Überprüfe, ob alle Termine gelöscht wurden
    const remainingAppointments = await Appointment.find({});
    expect(remainingAppointments).toHaveLength(0);
  });
}); 