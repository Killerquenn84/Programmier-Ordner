import { Request, Response } from 'express';
import Appointment from '../models/Appointment';

// Termin erstellen
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientName, patientGeburtsdatum, arztId, datum, uhrzeit, kommentar } = req.body;

    const appointment = new Appointment({
      patientName,
      patientGeburtsdatum,
      arztId,
      datum,
      uhrzeit,
      kommentar,
      status: 'angefragt'
    });

    await appointment.save();

    res.status(201).json({
      message: 'Terminanfrage erfolgreich erstellt',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler bei der Terminerstellung', error });
  }
};

// Termine eines Patienten abrufen
export const getPatientAppointments = async (req: Request, res: Response) => {
  try {
    const { patientName, patientGeburtsdatum } = req.query;

    const appointments = await Appointment.find({
      patientName,
      patientGeburtsdatum
    }).sort({ datum: 1, uhrzeit: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler beim Abrufen der Termine', error });
  }
};

// Termine eines Arztes abrufen
export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({
      arztId: doctorId
    }).sort({ datum: 1, uhrzeit: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler beim Abrufen der Termine', error });
  }
};

// Termin bestätigen
export const confirmAppointment = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { doctor } = req;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Termin nicht gefunden' });
    }

    if (appointment.arztId !== doctor.id) {
      return res.status(403).json({ message: 'Keine Berechtigung für diesen Termin' });
    }

    appointment.status = 'bestätigt';
    await appointment.save();

    res.json({
      message: 'Termin erfolgreich bestätigt',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler bei der Terminbestätigung', error });
  }
};

// Termin ablehnen
export const rejectAppointment = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { doctor } = req;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Termin nicht gefunden' });
    }

    if (appointment.arztId !== doctor.id) {
      return res.status(403).json({ message: 'Keine Berechtigung für diesen Termin' });
    }

    appointment.status = 'abgelehnt';
    await appointment.save();

    res.json({
      message: 'Termin erfolgreich abgelehnt',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler bei der Terminablehnung', error });
  }
}; 