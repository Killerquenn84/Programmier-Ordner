import { Request, Response } from 'express';
import Doctor, { IDoctor } from '../models/Doctor';
import { generateToken } from '../middleware/auth';

// Arzt registrieren
export const registerDoctor = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, specialization } = req.body;

    // Prüfen, ob Arzt bereits existiert
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Arzt mit dieser E-Mail existiert bereits' });
    }

    // Neuen Arzt erstellen
    const doctor = new Doctor({
      email,
      password,
      firstName,
      lastName,
      specialization
    });

    await doctor.save();

    // Token generieren
    const token = generateToken(doctor._id.toString());

    res.status(201).json({
      message: 'Arzt erfolgreich registriert',
      token,
      doctor: {
        id: doctor._id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler bei der Registrierung', error });
  }
};

// Arzt einloggen
export const loginDoctor = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Arzt finden
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Passwort überprüfen
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
    }

    // Token generieren
    const token = generateToken(doctor._id.toString());

    res.json({
      message: 'Erfolgreich eingeloggt',
      token,
      doctor: {
        id: doctor._id,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server-Fehler beim Login', error });
  }
}; 