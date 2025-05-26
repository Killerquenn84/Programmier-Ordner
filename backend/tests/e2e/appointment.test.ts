import request from 'supertest';
import mongoose from 'mongoose';
import { Appointment } from '../../src/models/appointment.model';
import { generateToken, TokenPayload } from '../../src/utils/auth';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../../src/app';

describe('Appointment E2E Tests', () => {
  let doctorToken: string;
  let patientToken: string;
  let adminToken: string;
  let appointmentId: string;

  beforeEach(async () => {
    // Generiere Tokens für Tests
    const doctorPayload: TokenPayload = {
      userId: 'doctor-user',
      role: 'doctor',
      doctorId: new mongoose.Types.ObjectId().toString(),
      sessionId: 'doctor-session'
    };
    const patientPayload: TokenPayload = {
      userId: 'patient-user',
      role: 'patient',
      patientId: new mongoose.Types.ObjectId().toString(),
      sessionId: 'patient-session'
    };
    const adminPayload: TokenPayload = {
      userId: 'admin-user',
      role: 'admin',
      sessionId: 'admin-session'
    };

    doctorToken = generateToken(doctorPayload);
    patientToken = generateToken(patientPayload);
    adminToken = generateToken(adminPayload);
  });

  afterEach(async () => {
    // Lösche alle Test-Termine
    await Appointment.deleteMany({});
  });

  // Test-Daten
  const appointmentData = {
    date: new Date('2023-03-15T10:00:00Z'),
    time: '10:00',
    duration: 30,
    status: 'scheduled',
    doctorId: new mongoose.Types.ObjectId(),
    patientId: new mongoose.Types.ObjectId(),
    description: 'Routineuntersuchung',
    notes: 'Patient hat keine Beschwerden'
  };

  // Test: Vollständiger Workflow für einen Termin
  it('sollte einen vollständigen Workflow für einen Termin durchführen', async () => {
    // 1. Admin erstellt einen Termin
    const createResponse = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(appointmentData);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.date).toBe(appointmentData.date.toISOString());
    expect(createResponse.body.duration).toBe(appointmentData.duration);
    expect(createResponse.body.status).toBe(appointmentData.status);
    expect(createResponse.body.doctorId).toBe(appointmentData.doctorId.toString());
    expect(createResponse.body.patientId).toBe(appointmentData.patientId.toString());
    expect(createResponse.body.description).toBe(appointmentData.description);
    expect(createResponse.body.notes).toBe(appointmentData.notes);

    const appointmentId = createResponse.body._id;

    // 2. Arzt ruft den Termin ab
    const doctorGetResponse = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send();

    expect(doctorGetResponse.status).toBe(200);
    expect(doctorGetResponse.body._id).toBe(appointmentId);

    // 3. Arzt aktualisiert den Termin
    const updateData = {
      status: 'in_progress',
      notes: 'Untersuchung läuft'
    };

    const updateResponse = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.status).toBe(updateData.status);
    expect(updateResponse.body.notes).toBe(updateData.notes);

    // 4. Patient ruft den Termin ab
    const patientGetResponse = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send();

    expect(patientGetResponse.status).toBe(200);
    expect(patientGetResponse.body._id).toBe(appointmentId);
    expect(patientGetResponse.body.status).toBe(updateData.status);

    // 5. Arzt schließt den Termin ab
    const completeData = {
      status: 'completed',
      notes: 'Untersuchung abgeschlossen'
    };

    const completeResponse = await request(app)
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(completeData);

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe(completeData.status);
    expect(completeResponse.body.notes).toBe(completeData.notes);

    // 6. Admin löscht den Termin
    const deleteResponse = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(deleteResponse.status).toBe(204);

    // 7. Überprüfe, ob der Termin gelöscht wurde
    const getDeletedResponse = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(getDeletedResponse.status).toBe(404);
  });

  // Test: Terminplanung und -verwaltung
  it('sollte Terminplanung und -verwaltung durchführen', async () => {
    // 1. Admin erstellt mehrere Termine
    const appointments = [
      {
        ...appointmentData,
        date: new Date('2023-03-15T10:00:00Z'),
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId()
      },
      {
        ...appointmentData,
        date: new Date('2023-03-15T11:00:00Z'),
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId()
      },
      {
        ...appointmentData,
        date: new Date('2023-03-16T10:00:00Z'),
        doctorId: new mongoose.Types.ObjectId(),
        patientId: new mongoose.Types.ObjectId()
      }
    ];

    const createdAppointments = [];

    for (const appointment of appointments) {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointment);

      expect(response.status).toBe(201);
      createdAppointments.push(response.body);
    }

    // 2. Arzt ruft seine Termine ab
    const doctorId = appointments[0].doctorId.toString();
    const doctorAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${doctorToken}`)
      .query({ doctorId });

    expect(doctorAppointmentsResponse.status).toBe(200);
    expect(doctorAppointmentsResponse.body.length).toBe(1);
    expect(doctorAppointmentsResponse.body[0].doctorId).toBe(doctorId);

    // 3. Patient ruft seine Termine ab
    const patientId = appointments[0].patientId.toString();
    const patientAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .query({ patientId });

    expect(patientAppointmentsResponse.status).toBe(200);
    expect(patientAppointmentsResponse.body.length).toBe(1);
    expect(patientAppointmentsResponse.body[0].patientId).toBe(patientId);

    // 4. Admin ruft Termine nach Datum ab
    const dateAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2023-03-15T23:59:59Z'
      });

    expect(dateAppointmentsResponse.status).toBe(200);
    expect(dateAppointmentsResponse.body.length).toBe(2);

    // 5. Admin ruft Termine nach Status ab
    const statusAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ status: 'scheduled' });

    expect(statusAppointmentsResponse.status).toBe(200);
    expect(statusAppointmentsResponse.body.length).toBe(3);

    // 6. Admin aktualisiert mehrere Termine
    for (const appointment of createdAppointments) {
      const updateResponse = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.status).toBe('completed');
    }

    // 7. Überprüfe, ob alle Termine aktualisiert wurden
    const updatedStatusResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ status: 'completed' });

    expect(updatedStatusResponse.status).toBe(200);
    expect(updatedStatusResponse.body.length).toBe(3);

    // 8. Admin löscht alle Termine
    for (const appointment of createdAppointments) {
      const deleteResponse = await request(app)
        .delete(`/api/appointments/${appointment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      expect(deleteResponse.status).toBe(204);
    }

    // 9. Überprüfe, ob alle Termine gelöscht wurden
    const allAppointmentsResponse = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(allAppointmentsResponse.status).toBe(200);
    expect(allAppointmentsResponse.body.length).toBe(0);
  });

  // Test: Fehlerbehandlung
  it('sollte Fehler korrekt behandeln', async () => {
    // 1. Versuche, einen Termin mit ungültigen Daten zu erstellen
    const invalidData = {
      ...appointmentData,
      date: 'invalid-date'
    };

    const invalidCreateResponse = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(invalidCreateResponse.status).toBe(400);

    // 2. Versuche, einen nicht existierenden Termin abzurufen
    const nonExistentId = new mongoose.Types.ObjectId();
    const getNonExistentResponse = await request(app)
      .get(`/api/appointments/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(getNonExistentResponse.status).toBe(404);

    // 3. Versuche, einen nicht existierenden Termin zu aktualisieren
    const updateNonExistentResponse = await request(app)
      .put(`/api/appointments/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'completed' });

    expect(updateNonExistentResponse.status).toBe(404);

    // 4. Versuche, einen nicht existierenden Termin zu löschen
    const deleteNonExistentResponse = await request(app)
      .delete(`/api/appointments/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(deleteNonExistentResponse.status).toBe(404);

    // 5. Versuche, einen Termin mit ungültigen Daten zu aktualisieren
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    const invalidUpdateResponse = await request(app)
      .put(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'invalid-status' });

    expect(invalidUpdateResponse.status).toBe(400);

    // 6. Versuche, einen Termin ohne Berechtigung zu aktualisieren
    const unauthorizedUpdateResponse = await request(app)
      .put(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ status: 'completed' });

    expect(unauthorizedUpdateResponse.status).toBe(403);

    // 7. Versuche, einen Termin ohne Berechtigung zu löschen
    const unauthorizedDeleteResponse = await request(app)
      .delete(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send();

    expect(unauthorizedDeleteResponse.status).toBe(403);
  });
});