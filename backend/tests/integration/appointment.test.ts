import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { Appointment } from '../../src/models/appointment.model';
import { generateToken } from '../../src/utils/auth';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Appointment Integration Tests', () => {
  let token: string;
  let appointmentId: string;

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

  // Test: Termin erstellen
  it('sollte einen neuen Termin erstellen', async () => {
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

    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send(appointmentData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.date).toBe(appointmentData.date.toISOString());
    expect(response.body.duration).toBe(appointmentData.duration);
    expect(response.body.status).toBe(appointmentData.status);
    expect(response.body.doctorId).toBe(appointmentData.doctorId.toString());
    expect(response.body.patientId).toBe(appointmentData.patientId.toString());
    expect(response.body.description).toBe(appointmentData.description);
    expect(response.body.notes).toBe(appointmentData.notes);

    appointmentId = response.body._id;
  });

  // Test: Termin abrufen
  it('sollte einen Termin abrufen', async () => {
    // Erstelle einen Termin
    const appointment = new Appointment({
      date: new Date('2023-03-15T10:00:00Z'),
      duration: 30,
      status: 'scheduled',
      doctorId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId(),
      description: 'Routineuntersuchung',
      notes: 'Patient hat keine Beschwerden'
    });
    const savedAppointment = await appointment.save();

    const response = await request(app)
      .get(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(savedAppointment._id.toString());
    expect(response.body.date).toBe(savedAppointment.date.toISOString());
    expect(response.body.duration).toBe(savedAppointment.duration);
    expect(response.body.status).toBe(savedAppointment.status);
    expect(response.body.doctorId).toBe(savedAppointment.doctorId.toString());
    expect(response.body.patientId).toBe(savedAppointment.patientId.toString());
    expect(response.body.description).toBe(savedAppointment.description);
    expect(response.body.notes).toBe(savedAppointment.notes);
  });

  // Test: Termin aktualisieren
  it('sollte einen Termin aktualisieren', async () => {
    // Erstelle einen Termin
    const appointment = new Appointment({
      date: new Date('2023-03-15T10:00:00Z'),
      duration: 30,
      status: 'scheduled',
      doctorId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId(),
      description: 'Routineuntersuchung',
      notes: 'Patient hat keine Beschwerden'
    });
    const savedAppointment = await appointment.save();

    const updateData = {
      status: 'completed',
      notes: 'Untersuchung erfolgreich durchgeführt'
    };

    const response = await request(app)
      .put(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(updateData.status);
    expect(response.body.notes).toBe(updateData.notes);
  });

  // Test: Termin löschen
  it('sollte einen Termin löschen', async () => {
    // Erstelle einen Termin
    const appointment = new Appointment({
      date: new Date('2023-03-15T10:00:00Z'),
      duration: 30,
      status: 'scheduled',
      doctorId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId(),
      description: 'Routineuntersuchung',
      notes: 'Patient hat keine Beschwerden'
    });
    const savedAppointment = await appointment.save();

    const response = await request(app)
      .delete(`/api/appointments/${savedAppointment._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(204);

    // Überprüfe, ob der Termin wirklich gelöscht wurde
    const deletedAppointment = await Appointment.findById(savedAppointment._id);
    expect(deletedAppointment).toBeNull();
  });

  // Test: Termine nach Datum filtern
  it('sollte Termine nach Datum filtern', async () => {
    // Erstelle Termine
    const appointment1 = new Appointment({
      date: new Date('2023-03-15T10:00:00Z')
    });
    const appointment2 = new Appointment({
      date: new Date('2023-03-16T10:00:00Z')
    });
    const appointment3 = new Appointment({
      date: new Date('2023-03-17T10:00:00Z')
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Datum
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2023-03-16T23:59:59Z'
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].date).toBe(appointment1.date.toISOString());
    expect(response.body[1].date).toBe(appointment2.date.toISOString());
  });

  // Test: Termine nach Status filtern
  it('sollte Termine nach Status filtern', async () => {
    // Erstelle Termine
    const appointment1 = new Appointment({
      status: 'scheduled'
    });
    const appointment2 = new Appointment({
      status: 'completed'
    });
    const appointment3 = new Appointment({
      status: 'cancelled'
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Status
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: 'scheduled' });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].status).toBe('scheduled');
  });

  // Test: Termine nach Arzt filtern
  it('sollte Termine nach Arzt filtern', async () => {
    const doctorId = new mongoose.Types.ObjectId();

    // Erstelle Termine
    const appointment1 = new Appointment({
      doctorId
    });
    const appointment2 = new Appointment({
      doctorId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      doctorId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Arzt
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({ doctorId: doctorId.toString() });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].doctorId).toBe(doctorId.toString());
    expect(response.body[1].doctorId).toBe(doctorId.toString());
  });

  // Test: Termine nach Patient filtern
  it('sollte Termine nach Patient filtern', async () => {
    const patientId = new mongoose.Types.ObjectId();

    // Erstelle Termine
    const appointment1 = new Appointment({
      patientId
    });
    const appointment2 = new Appointment({
      patientId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      patientId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Patient
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({ patientId: patientId.toString() });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].patientId).toBe(patientId.toString());
    expect(response.body[1].patientId).toBe(patientId.toString());
  });

  // Test: Termine nach Datum und Status filtern
  it('sollte Termine nach Datum und Status filtern', async () => {
    // Erstelle Termine
    const appointment1 = new Appointment({
      date: new Date('2023-03-15T10:00:00Z'),
      status: 'scheduled'
    });
    const appointment2 = new Appointment({
      date: new Date('2023-03-15T11:00:00Z'),
      status: 'completed'
    });
    const appointment3 = new Appointment({
      date: new Date('2023-03-16T10:00:00Z'),
      status: 'scheduled'
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Datum und Status
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2023-03-15T23:59:59Z',
        status: 'scheduled'
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].date).toBe(appointment1.date.toISOString());
    expect(response.body[0].status).toBe('scheduled');
  });

  // Test: Termine nach Datum und Arzt filtern
  it('sollte Termine nach Datum und Arzt filtern', async () => {
    const doctorId = new mongoose.Types.ObjectId();

    // Erstelle Termine
    const appointment1 = new Appointment({
      date: new Date('2023-03-15T10:00:00Z'),
      doctorId
    });
    const appointment2 = new Appointment({
      date: new Date('2023-03-15T11:00:00Z'),
      doctorId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      date: new Date('2023-03-16T10:00:00Z'),
      doctorId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Datum und Arzt
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2023-03-15T23:59:59Z',
        doctorId: doctorId.toString()
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].date).toBe(appointment1.date.toISOString());
    expect(response.body[0].doctorId).toBe(doctorId.toString());
  });

  // Test: Termine nach Datum und Patient filtern
  it('sollte Termine nach Datum und Patient filtern', async () => {
    const patientId = new mongoose.Types.ObjectId();

    // Erstelle Termine
    const appointment1 = new Appointment({
      date: new Date('2023-03-15T10:00:00Z'),
      patientId
    });
    const appointment2 = new Appointment({
      date: new Date('2023-03-15T11:00:00Z'),
      patientId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      date: new Date('2023-03-16T10:00:00Z'),
      patientId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Datum und Patient
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({
        startDate: '2023-03-15T00:00:00Z',
        endDate: '2023-03-15T23:59:59Z',
        patientId: patientId.toString()
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].date).toBe(appointment1.date.toISOString());
    expect(response.body[0].patientId).toBe(patientId.toString());
  });

  // Test: Termine nach Status und Arzt filtern
  it('sollte Termine nach Status und Arzt filtern', async () => {
    const doctorId = new mongoose.Types.ObjectId();

    // Erstelle Termine
    const appointment1 = new Appointment({
      status: 'scheduled',
      doctorId
    });
    const appointment2 = new Appointment({
      status: 'scheduled',
      doctorId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      status: 'completed',
      doctorId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    // Filtere Termine nach Status und Arzt
    const response = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .query({
        status: 'scheduled',
        doctorId: doctorId.toString()
      });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].status).toBe('scheduled');
    expect(response.body[0].doctorId).toBe(doctorId.toString());
  });
}); 