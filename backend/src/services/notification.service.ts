import { config } from '../config';
import { emailService } from './email.service';
import { smsService } from './sms.service';
import { whatsappService } from './whatsapp.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('NotificationService');

interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
}

interface AppointmentNotificationData {
  date: Date;
  time: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientWhatsApp?: string;
  reason?: string;
}

export class NotificationService {
  public async sendAppointmentConfirmation(
    data: AppointmentNotificationData,
    preferences?: NotificationPreferences
  ): Promise<void> {
    try {
      const tasks = [];

      // E-Mail-Benachrichtigung
      if (this.shouldSendEmail(preferences)) {
        tasks.push(
          emailService.sendAppointmentConfirmation(
            data.patientEmail,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              patientName: data.patientName
            }
          )
        );
      }

      // SMS-Benachrichtigung
      if (this.shouldSendSMS(preferences) && data.patientPhone) {
        tasks.push(
          smsService.sendAppointmentConfirmation(
            data.patientPhone,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName
            }
          )
        );
      }

      // WhatsApp-Benachrichtigung
      if (this.shouldSendWhatsApp(preferences) && data.patientWhatsApp) {
        tasks.push(
          whatsappService.sendAppointmentConfirmation(
            data.patientWhatsApp,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              patientName: data.patientName
            }
          )
        );
      }

      await Promise.all(tasks);
      logger.info(`Benachrichtigungen für Terminbestätigung erfolgreich gesendet an ${data.patientName}`);
    } catch (error) {
      logger.error(`Fehler beim Senden der Terminbestätigungen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      throw error;
    }
  }

  public async sendAppointmentReminder(
    data: AppointmentNotificationData,
    preferences?: NotificationPreferences
  ): Promise<void> {
    try {
      const tasks = [];

      // E-Mail-Benachrichtigung
      if (this.shouldSendEmail(preferences)) {
        tasks.push(
          emailService.sendAppointmentReminder(
            data.patientEmail,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              patientName: data.patientName
            }
          )
        );
      }

      // SMS-Benachrichtigung
      if (this.shouldSendSMS(preferences) && data.patientPhone) {
        tasks.push(
          smsService.sendAppointmentReminder(
            data.patientPhone,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName
            }
          )
        );
      }

      // WhatsApp-Benachrichtigung
      if (this.shouldSendWhatsApp(preferences) && data.patientWhatsApp) {
        tasks.push(
          whatsappService.sendAppointmentReminder(
            data.patientWhatsApp,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              patientName: data.patientName
            }
          )
        );
      }

      await Promise.all(tasks);
      logger.info(`Benachrichtigungen für Terminerinnerung erfolgreich gesendet an ${data.patientName}`);
    } catch (error) {
      logger.error(`Fehler beim Senden der Terminerinnerungen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      throw error;
    }
  }

  public async sendAppointmentCancellation(
    data: AppointmentNotificationData,
    preferences?: NotificationPreferences
  ): Promise<void> {
    try {
      const tasks = [];

      // E-Mail-Benachrichtigung
      if (this.shouldSendEmail(preferences)) {
        tasks.push(
          emailService.sendAppointmentCancellation(
            data.patientEmail,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              patientName: data.patientName,
              reason: data.reason
            }
          )
        );
      }

      // SMS-Benachrichtigung
      if (this.shouldSendSMS(preferences) && data.patientPhone) {
        tasks.push(
          smsService.sendAppointmentCancellation(
            data.patientPhone,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              reason: data.reason
            }
          )
        );
      }

      // WhatsApp-Benachrichtigung
      if (this.shouldSendWhatsApp(preferences) && data.patientWhatsApp) {
        tasks.push(
          whatsappService.sendAppointmentCancellation(
            data.patientWhatsApp,
            {
              date: data.date,
              time: data.time,
              doctorName: data.doctorName,
              patientName: data.patientName,
              reason: data.reason
            }
          )
        );
      }

      await Promise.all(tasks);
      logger.info(`Benachrichtigungen für Terminstornierung erfolgreich gesendet an ${data.patientName}`);
    } catch (error) {
      logger.error(`Fehler beim Senden der Terminstornierungen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
      throw error;
    }
  }

  private shouldSendEmail(preferences?: NotificationPreferences): boolean {
    return preferences?.email ?? config.notificationPreferences.email.enabled;
  }

  private shouldSendSMS(preferences?: NotificationPreferences): boolean {
    return preferences?.sms ?? config.notificationPreferences.sms.enabled;
  }

  private shouldSendWhatsApp(preferences?: NotificationPreferences): boolean {
    return preferences?.whatsapp ?? config.notificationPreferences.whatsapp.enabled;
  }
}

export const notificationService = new NotificationService(); 