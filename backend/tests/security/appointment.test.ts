import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { Appointment } from '../../src/models/appointment.model';
import { generateToken, TokenPayload } from '../../src/utils/auth';
import { describe, it, expect } from '@jest/globals';

describe('Appointment Security Tests', () => {
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

  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;

  // Vor jedem Test
  beforeEach(async () => {
    // Generiere Tokens für Tests
    adminToken = generateToken({ 
      userId: 'admin-user', 
      role: 'admin',
      sessionId: 'admin-session'
    });
    doctorToken = generateToken({ 
      userId: 'doctor-user', 
      role: 'doctor',
      sessionId: 'doctor-session'
    });
    patientToken = generateToken({ 
      userId: 'patient-user', 
      role: 'patient',
      sessionId: 'patient-session'
    });
  });

  // Test: Kein Zugriff ohne Token
  it('sollte keinen Zugriff ohne Token erlauben', async () => {
    const response = await request(app)
      .get('/api/appointments')
      .send();

    expect(response.status).toBe(401);
  });

  // Test: Kein Zugriff mit ungültigem Token
  it('sollte keinen Zugriff mit ungültigem Token erlauben', async () => {
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', 'Bearer invalid-token')
      .send();

    expect(response.status).toBe(401);
  });

  // Test: Patienten nur ihre eigenen Termine sehen lassen
  it('sollte Patienten nur ihre eigenen Termine sehen lassen', async () => {
    // Erstelle Termine
    const patientId1 = new mongoose.Types.ObjectId();
    const patientId2 = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      patientId: patientId1
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      patientId: patientId2
    });

    await appointment1.save();
    await appointment2.save();

    // Generiere Token für Patient 1
    const patient1Token = generateToken({
      userId: 'patient1-user',
      role: 'patient',
      patientId: patientId1.toString(),
      sessionId: 'patient1-session'
    });

    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${patient1Token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].patientId).toBe(patientId1.toString());
  });

  // Test: Ärzte nur ihre eigenen Termine sehen lassen
  it('sollte Ärzte nur ihre eigenen Termine sehen lassen', async () => {
    // Erstelle Termine
    const doctorId1 = new mongoose.Types.ObjectId();
    const doctorId2 = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      doctorId: doctorId1
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      doctorId: doctorId2
    });

    await appointment1.save();
    await appointment2.save();

    // Generiere Token für Arzt 1
    const doctor1Token = generateToken({
      userId: 'doctor1-user',
      role: 'doctor',
      doctorId: doctorId1.toString(),
      sessionId: 'doctor1-session'
    });

    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${doctor1Token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].doctorId).toBe(doctorId1.toString());
  });

  // Test: Admins alle Termine sehen lassen
  it('sollte Admins alle Termine sehen lassen', async () => {
    // Erstelle Termine
    const appointment1 = new Appointment({
      ...appointmentData,
      doctorId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId()
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      doctorId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId()
    });

    await appointment1.save();
    await appointment2.save();

    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // Test: Patienten keine Termine erstellen lassen
  it('sollte Patienten keine Termine erstellen lassen', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(appointmentData);

    expect(response.status).toBe(403);
  });

  // Test: Patienten keine Termine aktualisieren lassen
  it('sollte Patienten keine Termine aktualisieren lassen', async () => {
    // Erstelle einen Termin
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    const response = await request(app)
      .put(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ status: 'completed' });

    expect(response.status).toBe(403);
  });

  // Test: Patienten keine Termine löschen lassen
  it('sollte Patienten keine Termine löschen lassen', async () => {
    // Erstelle einen Termin
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    const response = await request(app)
      .delete(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send();

    expect(response.status).toBe(403);
  });

  // Test: Ärzte nur ihre eigenen Termine aktualisieren lassen
  it('sollte Ärzte nur ihre eigenen Termine aktualisieren lassen', async () => {
    // Erstelle Termine
    const doctorId1 = new mongoose.Types.ObjectId();
    const doctorId2 = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      doctorId: doctorId1
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      doctorId: doctorId2
    });

    await appointment1.save();
    await appointment2.save();

    // Generiere Token für Arzt 1
    const doctor1Token = generateToken({
      userId: 'doctor1-user',
      role: 'doctor',
      doctorId: doctorId1.toString(),
      sessionId: 'doctor1-session'
    });

    // Versuche, Termin von Arzt 2 zu aktualisieren
    const response = await request(app)
      .put(`/api/appointments/${appointment2._id}`)
      .set('Authorization', `Bearer ${doctor1Token}`)
      .send({ status: 'completed' });

    expect(response.status).toBe(403);
  });

  // Test: Ärzte nur ihre eigenen Termine löschen lassen
  it('sollte Ärzte nur ihre eigenen Termine löschen lassen', async () => {
    // Erstelle Termine
    const doctorId1 = new mongoose.Types.ObjectId();
    const doctorId2 = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      doctorId: doctorId1
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      doctorId: doctorId2
    });

    await appointment1.save();
    await appointment2.save();

    // Generiere Token für Arzt 1
    const doctor1Token = generateToken({
      userId: 'doctor1-user',
      role: 'doctor',
      doctorId: doctorId1.toString(),
      sessionId: 'doctor1-session'
    });

    // Versuche, Termin von Arzt 2 zu löschen
    const response = await request(app)
      .delete(`/api/appointments/${appointment2._id}`)
      .set('Authorization', `Bearer ${doctor1Token}`)
      .send();

    expect(response.status).toBe(403);
  });
}); 