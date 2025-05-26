import twilio from 'twilio';
import { config } from '../config';
import { EncryptionService } from '../utils/encryption';
import { createLogger } from '../utils/logger';

const logger = createLogger('SMSService');
const encryptionService = EncryptionService.getInstance();

interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      config.twilioAccountSid,
      config.twilioAuthToken
    );
  }

  private async encryptMessage(message: string): Promise<string> {
    return encryptionService.encrypt(message);
  }

  private async decryptMessage(encryptedMessage: string): Promise<string> {
    return encryptionService.decrypt(encryptedMessage);
  }

  public async sendSMS(options: SMSOptions): Promise<void> {
    try {
      // Verschlüssele Nachricht
      const encryptedMessage = await this.encryptMessage(options.message);

      // Sende SMS
      await this.client.messages.create({
        body: encryptedMessage,
        to: options.to,
        from: config.twilioPhoneNumber
      });

      logger.info(`SMS erfolgreich gesendet an ${options.to}`);
    } catch (error) {
      logger.error(`Fehler beim Senden der SMS: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      throw error;
    }
  }

  public async sendAppointmentConfirmation(
    to: string,
    appointmentData: {
      date: Date;
      time: string;
      doctorName: string;
    }
  ): Promise<void> {
    const message = `
      Ihr Termin wurde bestätigt:
      Datum: ${appointmentData.date.toLocaleDateString()}
      Uhrzeit: ${appointmentData.time}
      Arzt: ${appointmentData.doctorName}
    `;

    await this.sendSMS({
      to,
      message
    });
  }

  public async sendAppointmentReminder(
    to: string,
    appointmentData: {
      date: Date;
      time: string;
      doctorName: string;
    }
  ): Promise<void> {
    const message = `
      Erinnerung an Ihren Termin:
      Datum: ${appointmentData.date.toLocaleDateString()}
      Uhrzeit: ${appointmentData.time}
      Arzt: ${appointmentData.doctorName}
    `;

    await this.sendSMS({
      to,
      message
    });
  }

  public async sendAppointmentCancellation(
    to: string,
    appointmentData: {
      date: Date;
      time: string;
      doctorName: string;
      reason?: string;
    }
  ): Promise<void> {
    const message = `
      Ihr Termin wurde storniert:
      Datum: ${appointmentData.date.toLocaleDateString()}
      Uhrzeit: ${appointmentData.time}
      Arzt: ${appointmentData.doctorName}
      ${appointmentData.reason ? `Grund: ${appointmentData.reason}` : ''}
    `;

    await this.sendSMS({
      to,
      message
    });
  }
}

export const smsService = new SMSService(); 