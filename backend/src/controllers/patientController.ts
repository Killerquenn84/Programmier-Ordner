import { Request, Response } from 'express';
import Patient from '../models/Patient';

// Patienten identifizieren oder erstellen
export const identifyPatient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, birthDate, address, phoneNumber, email } = req.body;

    // Suche nach existierendem Patienten
    const existingPatient = await Patient.findOne({
      firstName,
      lastName,
      birthDate: new Date(birthDate)
    });

    if (existingPatient) {
      // Patient existiert bereits
      return res.json({
        message: 'Patient identifiziert',
        patient: existingPatient,
        isNew: false
      });
    }

    // Neuen Patienten erstellen
    const newPatient = new Patient({
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      address,
      phoneNumber,
      email
    });

    await newPatient.save();

    res.status(201).json({
      message: 'Neuer Patient erstellt',
      patient: newPatient,
      isNew: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler bei der Patientenidentifikation', error });
  }
};

// Patienten-Daten abrufen
export const getPatientData = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, birthDate } = req.query;

    const patient = await Patient.findOne({
      firstName,
      lastName,
      birthDate: new Date(birthDate as string)
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient nicht gefunden' });
    }

    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler beim Abrufen der Patientendaten', error });
  }
}; 