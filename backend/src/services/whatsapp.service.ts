import { Client, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { config } from '../config';
import { EncryptionService } from '../utils/encryption';
import { createLogger } from '../utils/logger';

const logger = createLogger('WhatsAppService');
const encryptionService = EncryptionService.getInstance();

interface WhatsAppOptions {
  to: string;
  message: string;
}

export class WhatsAppService {
  private client: Client;

  constructor() {
    this.client = new Client({
      puppeteer: {
        args: ['--no-sandbox']
      }
    });

    this.initializeClient();
  }

  private initializeClient(): void {
    this.client.on('qr', (qr: string) => {
      // QR-Code in der Konsole anzeigen
      qrcode.generate(qr, { small: true });
      logger.info('QR-Code generiert. Bitte scannen Sie den Code mit WhatsApp.');
    });

    this.client.on('ready', () => {
      logger.info('WhatsApp-Client ist bereit');
    });

    this.client.on('message', async (message: Message) => {
      try {
        // Entschlüssele eingehende Nachrichten
        const decryptedMessage = await this.decryptMessage(message.body);
        logger.info(`Nachricht empfangen von ${message.from}: ${decryptedMessage}`);
      } catch (error) {
        logger.error(`Fehler beim Verarbeiten der Nachricht: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      }
    });

    this.client.initialize();
  }

  private async encryptMessage(message: string): Promise<string> {
    return encryptionService.encrypt(message);
  }

  private async decryptMessage(encryptedMessage: string): Promise<string> {
    return encryptionService.decrypt(encryptedMessage);
  }

  public async sendMessage(options: WhatsAppOptions): Promise<void> {
    try {
      // Verschlüssele Nachricht
      const encryptedMessage = await this.encryptMessage(options.message);

      // Sende WhatsApp-Nachricht
      await this.client.sendMessage(options.to, encryptedMessage);

      logger.info(`WhatsApp-Nachricht erfolgreich gesendet an ${options.to}`);
    } catch (error) {
      logger.error(`Fehler beim Senden der WhatsApp-Nachricht: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
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
    const message = `
      *Terminbestätigung*
      
      Sehr geehrte(r) ${appointmentData.patientName},
      
      Ihr Termin wurde erfolgreich bestätigt:
      
      📅 Datum: ${appointmentData.date.toLocaleDateString()}
      ⏰ Uhrzeit: ${appointmentData.time}
      👨‍⚕️ Arzt: ${appointmentData.doctorName}
      
      Mit freundlichen Grüßen,
      Ihr Arztpraxis-Team
    `;

    await this.sendMessage({
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
      patientName: string;
    }
  ): Promise<void> {
    const message = `
      *Terminerinnerung*
      
      Sehr geehrte(r) ${appointmentData.patientName},
      
      Wir erinnern Sie an Ihren bevorstehenden Termin:
      
      📅 Datum: ${appointmentData.date.toLocaleDateString()}
      ⏰ Uhrzeit: ${appointmentData.time}
      👨‍⚕️ Arzt: ${appointmentData.doctorName}
      
      Mit freundlichen Grüßen,
      Ihr Arztpraxis-Team
    `;

    await this.sendMessage({
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
      patientName: string;
      reason?: string;
    }
  ): Promise<void> {
    const message = `
      *Terminstornierung*
      
      Sehr geehrte(r) ${appointmentData.patientName},
      
      Ihr Termin wurde storniert:
      
      📅 Datum: ${appointmentData.date.toLocaleDateString()}
      ⏰ Uhrzeit: ${appointmentData.time}
      👨‍⚕️ Arzt: ${appointmentData.doctorName}
      ${appointmentData.reason ? `📝 Grund: ${appointmentData.reason}` : ''}
      
      Mit freundlichen Grüßen,
      Ihr Arztpraxis-Team
    `;

    await this.sendMessage({
      to,
      message
    });
  }
}

export const whatsappService = new WhatsAppService(); 