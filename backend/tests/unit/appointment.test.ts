import mongoose from 'mongoose';
import { Appointment } from '../../src/models/appointment.model';
import { describe, it, expect } from '@jest/globals';

describe('Appointment Unit Tests', () => {
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

  // Test: Termin erstellen
  it('sollte einen Termin erstellen', async () => {
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    expect(savedAppointment._id).toBeDefined();
    expect(savedAppointment.date).toEqual(appointmentData.date);
    expect(savedAppointment.duration).toBe(appointmentData.duration);
    expect(savedAppointment.status).toBe(appointmentData.status);
    expect(savedAppointment.doctorId).toEqual(appointmentData.doctorId);
    expect(savedAppointment.patientId).toEqual(appointmentData.patientId);
    expect(savedAppointment.description).toBe(appointmentData.description);
    expect(savedAppointment.notes).toBe(appointmentData.notes);
  });

  // Test: Termin aktualisieren
  it('sollte einen Termin aktualisieren', async () => {
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    const updateData = {
      status: 'completed',
      notes: 'Untersuchung abgeschlossen'
    };

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      savedAppointment._id,
      updateData,
      { new: true }
    );

    expect(updatedAppointment).not.toBeNull();
    expect(updatedAppointment?.status).toBe(updateData.status);
    expect(updatedAppointment?.notes).toBe(updateData.notes);
  });

  // Test: Termin löschen
  it('sollte einen Termin löschen', async () => {
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    await Appointment.findByIdAndDelete(savedAppointment._id);

    const deletedAppointment = await Appointment.findById(savedAppointment._id);
    expect(deletedAppointment).toBeNull();
  });

  // Test: Termin nach ID finden
  it('sollte einen Termin nach ID finden', async () => {
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    const foundAppointment = await Appointment.findById(savedAppointment._id);

    expect(foundAppointment).not.toBeNull();
    expect(foundAppointment?._id).toEqual(savedAppointment._id);
    expect(foundAppointment?.date).toEqual(appointmentData.date);
    expect(foundAppointment?.duration).toBe(appointmentData.duration);
    expect(foundAppointment?.status).toBe(appointmentData.status);
    expect(foundAppointment?.doctorId).toEqual(appointmentData.doctorId);
    expect(foundAppointment?.patientId).toEqual(appointmentData.patientId);
    expect(foundAppointment?.description).toBe(appointmentData.description);
    expect(foundAppointment?.notes).toBe(appointmentData.notes);
  });

  // Test: Termine nach Datum filtern
  it('sollte Termine nach Datum filtern', async () => {
    const appointment1 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T10:00:00Z')
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-16T10:00:00Z')
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-17T10:00:00Z')
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const startDate = new Date('2023-03-15T00:00:00Z');
    const endDate = new Date('2023-03-16T23:59:59Z');

    const filteredAppointments = await Appointment.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    expect(filteredAppointments.length).toBe(2);
    expect(filteredAppointments[0].date).toEqual(appointment1.date);
    expect(filteredAppointments[1].date).toEqual(appointment2.date);
  });

  // Test: Termine nach Status filtern
  it('sollte Termine nach Status filtern', async () => {
    const appointment1 = new Appointment({
      ...appointmentData,
      status: 'scheduled'
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      status: 'completed'
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      status: 'cancelled'
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const filteredAppointments = await Appointment.find({
      status: 'scheduled'
    });

    expect(filteredAppointments.length).toBe(1);
    expect(filteredAppointments[0].status).toBe('scheduled');
  });

  // Test: Termine nach Arzt filtern
  it('sollte Termine nach Arzt filtern', async () => {
    const doctorId = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      doctorId
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      doctorId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      doctorId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const filteredAppointments = await Appointment.find({
      doctorId
    });

    expect(filteredAppointments.length).toBe(2);
    expect(filteredAppointments[0].doctorId).toEqual(doctorId);
    expect(filteredAppointments[1].doctorId).toEqual(doctorId);
  });

  // Test: Termine nach Patient filtern
  it('sollte Termine nach Patient filtern', async () => {
    const patientId = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      patientId
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      patientId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      patientId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const filteredAppointments = await Appointment.find({
      patientId
    });

    expect(filteredAppointments.length).toBe(2);
    expect(filteredAppointments[0].patientId).toEqual(patientId);
    expect(filteredAppointments[1].patientId).toEqual(patientId);
  });

  // Test: Termine nach Datum und Status filtern
  it('sollte Termine nach Datum und Status filtern', async () => {
    const appointment1 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T10:00:00Z'),
      status: 'scheduled'
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T11:00:00Z'),
      status: 'completed'
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-16T10:00:00Z'),
      status: 'scheduled'
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const startDate = new Date('2023-03-15T00:00:00Z');
    const endDate = new Date('2023-03-15T23:59:59Z');

    const filteredAppointments = await Appointment.find({
      date: {
        $gte: startDate,
        $lte: endDate
      },
      status: 'scheduled'
    });

    expect(filteredAppointments.length).toBe(1);
    expect(filteredAppointments[0].date).toEqual(appointment1.date);
    expect(filteredAppointments[0].status).toBe('scheduled');
  });

  // Test: Termine nach Datum und Arzt filtern
  it('sollte Termine nach Datum und Arzt filtern', async () => {
    const doctorId = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T10:00:00Z'),
      doctorId
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T11:00:00Z'),
      doctorId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-16T10:00:00Z'),
      doctorId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const startDate = new Date('2023-03-15T00:00:00Z');
    const endDate = new Date('2023-03-15T23:59:59Z');

    const filteredAppointments = await Appointment.find({
      date: {
        $gte: startDate,
        $lte: endDate
      },
      doctorId
    });

    expect(filteredAppointments.length).toBe(1);
    expect(filteredAppointments[0].date).toEqual(appointment1.date);
    expect(filteredAppointments[0].doctorId).toEqual(doctorId);
  });

  // Test: Termine nach Datum und Patient filtern
  it('sollte Termine nach Datum und Patient filtern', async () => {
    const patientId = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T10:00:00Z'),
      patientId
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-15T11:00:00Z'),
      patientId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      date: new Date('2023-03-16T10:00:00Z'),
      patientId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const startDate = new Date('2023-03-15T00:00:00Z');
    const endDate = new Date('2023-03-15T23:59:59Z');

    const filteredAppointments = await Appointment.find({
      date: {
        $gte: startDate,
        $lte: endDate
      },
      patientId
    });

    expect(filteredAppointments.length).toBe(1);
    expect(filteredAppointments[0].date).toEqual(appointment1.date);
    expect(filteredAppointments[0].patientId).toEqual(patientId);
  });

  // Test: Termine nach Status und Arzt filtern
  it('sollte Termine nach Status und Arzt filtern', async () => {
    const doctorId = new mongoose.Types.ObjectId();

    const appointment1 = new Appointment({
      ...appointmentData,
      status: 'scheduled',
      doctorId
    });
    const appointment2 = new Appointment({
      ...appointmentData,
      status: 'scheduled',
      doctorId: new mongoose.Types.ObjectId()
    });
    const appointment3 = new Appointment({
      ...appointmentData,
      status: 'completed',
      doctorId
    });

    await appointment1.save();
    await appointment2.save();
    await appointment3.save();

    const filteredAppointments = await Appointment.find({
      status: 'scheduled',
      doctorId
    });

    expect(filteredAppointments.length).toBe(1);
    expect(filteredAppointments[0].status).toBe('scheduled');
    expect(filteredAppointments[0].doctorId).toEqual(doctorId);
  });
}); 