import twilio from 'twilio';
import { IAppointment } from '../models/appointment.model';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  try {
    await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    return true;
  } catch (error) {
    console.error('SMS-Versand fehlgeschlagen:', error);
    return false;
  }
};

export const sendAppointmentReminder = async (appointment: IAppointment): Promise<boolean> => {
  const message = `
    Terminerinnerung:
    Datum: ${appointment.date}
    Dauer: ${appointment.duration} Minuten
    Beschreibung: ${appointment.description}
  `;

  return sendSMS('+491234567890', message);
}; 