import nodemailer from 'nodemailer';
import { IAppointment } from '../models/appointment.model';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (to: string, subject: string, text: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text
    });
    return true;
  } catch (error) {
    console.error('E-Mail-Versand fehlgeschlagen:', error);
    return false;
  }
};

export const sendAppointmentConfirmation = async (appointment: IAppointment): Promise<boolean> => {
  const subject = 'Terminbestätigung';
  const text = `
    Sehr geehrte(r) Patient(in),
    
    Ihr Termin wurde erfolgreich gebucht:
    Datum: ${appointment.date}
    Dauer: ${appointment.duration} Minuten
    Beschreibung: ${appointment.description}
    
    Mit freundlichen Grüßen
    Ihr Arztteam
  `;

  return sendEmail('patient@example.com', subject, text);
};

export const sendAppointmentReminder = async (appointment: IAppointment): Promise<boolean> => {
  const subject = 'Terminerinnerung';
  const text = `
    Sehr geehrte(r) Patient(in),
    
    Wir erinnern Sie an Ihren morgigen Termin:
    Datum: ${appointment.date}
    Dauer: ${appointment.duration} Minuten
    Beschreibung: ${appointment.description}
    
    Mit freundlichen Grüßen
    Ihr Arztteam
  `;

  return sendEmail('patient@example.com', subject, text);
}; 