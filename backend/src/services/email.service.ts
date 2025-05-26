import nodemailer from 'nodemailer';
import { config } from '../config';
import { EncryptionService } from '../utils/encryption';
import { createLogger } from '../utils/logger';

const logger = createLogger('EmailService');
const encryptionService = EncryptionService.getInstance();

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });
  }

  private async encryptEmailContent(content: string): Promise<string> {
    return encryptionService.encrypt(content);
  }

  private async decryptEmailContent(encryptedContent: string): Promise<string> {
    return encryptionService.decrypt(encryptedContent);
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Verschlüssele E-Mail-Inhalt
      const encryptedText = options.text ? await this.encryptEmailContent(options.text) : undefined;
      const encryptedHtml = options.html ? await this.encryptEmailContent(options.html) : undefined;

      // Verschlüssele Anhänge
      const encryptedAttachments = options.attachments?.map(attachment => ({
        ...attachment,
        content: typeof attachment.content === 'string' 
          ? encryptionService.encrypt(attachment.content)
          : attachment.content
      }));

      // Sende E-Mail
      await this.transporter.sendMail({
        from: config.smtpUser,
        to: options.to,
        subject: options.subject,
        text: encryptedText,
        html: encryptedHtml,
        attachments: encryptedAttachments
      });

      logger.info(`E-Mail erfolgreich gesendet an ${options.to}`);
    } catch (error) {
      logger.error(`Fehler beim Senden der E-Mail: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      throw error;
    }
  }

  public async sendAppointmentConfirmation(
    to: string,
    appointmentData: {
      date: Date;
      time: string;
      doctorName: string;
      patientName: string;
    }
  ): Promise<void> {
    const text = `
      Sehr geehrte(r) ${appointmentData.patientName},
      
      Ihr Termin wurde erfolgreich bestätigt:
      
      Datum: ${appointmentData.date.toLocaleDateString()}
      Uhrzeit: ${appointmentData.time}
      Arzt: ${appointmentData.doctorName}
      
      Mit freundlichen Grüßen,
      Ihr Arztpraxis-Team
    `;

    await this.sendEmail({
      to,
      subject: 'Terminbestätigung',
      text
    });
  }

  public async sendAppointmentReminder(
    to: string,
    appointmentData: {
      date: Date;
      time: string;
      doctorName: string;
      patientName: string;
    }
  ): Promise<void> {
    const text = `
      Sehr geehrte(r) ${appointmentData.patientName},
      
      Wir erinnern Sie an Ihren bevorstehenden Termin:
      
      Datum: ${appointmentData.date.toLocaleDateString()}
      Uhrzeit: ${appointmentData.time}
      Arzt: ${appointmentData.doctorName}
      
      Mit freundlichen Grüßen,
      Ihr Arztpraxis-Team
    `;

    await this.sendEmail({
      to,
      subject: 'Terminerinnerung',
      text
    });
  }

  public async sendAppointmentCancellation(
    to: string,
    appointmentData: {
      date: Date;
      time: string;
      doctorName: string;
      patientName: string;
      reason?: string;
    }
  ): Promise<void> {
    const text = `
      Sehr geehrte(r) ${appointmentData.patientName},
      
      Ihr Termin wurde storniert:
      
      Datum: ${appointmentData.date.toLocaleDateString()}
      Uhrzeit: ${appointmentData.time}
      Arzt: ${appointmentData.doctorName}
      ${appointmentData.reason ? `Grund: ${appointmentData.reason}` : ''}
      
      Mit freundlichen Grüßen,
      Ihr Arztpraxis-Team
    `;

    await this.sendEmail({
      to,
      subject: 'Terminstornierung',
      text
    });
  }
}

export const emailService = new EmailService(); 