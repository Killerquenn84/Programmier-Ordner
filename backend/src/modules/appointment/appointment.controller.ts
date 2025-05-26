import { Request, Response } from 'express';
import appointmentService, { CreateAppointmentDto, UpdateAppointmentDto } from './appointment.service';
import { IUser } from '../user/user.model';

export class AppointmentController {
  // Termin erstellen
  async createAppointment(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const appointmentData: CreateAppointmentDto = {
        ...req.body,
        patientId: user._id.toString()
      };

      // Verfügbarkeit prüfen
      const isAvailable = await appointmentService.checkAvailability(
        appointmentData.doctorId,
        appointmentData.date,
        appointmentData.time,
        appointmentData.duration || 30
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Der gewünschte Termin ist nicht verfügbar'
        });
      }

      const appointment = await appointmentService.createAppointment(appointmentData);
      res.status(201).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Erstellen des Termins',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termin nach ID abrufen
  async getAppointmentById(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.findById(req.params.id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Termin nicht gefunden'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen des Termins',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termine nach Arzt abrufen
  async getAppointmentsByDoctor(req: Request, res: Response) {
    try {
      const appointments = await appointmentService.findByDoctorId(req.params.doctorId);
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Termine',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termine nach Patient abrufen
  async getAppointmentsByPatient(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const appointments = await appointmentService.findByPatientId(user._id.toString());
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Termine',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termine nach Datum abrufen
  async getAppointmentsByDate(req: Request, res: Response) {
    try {
      const date = new Date(req.params.date);
      const appointments = await appointmentService.findByDate(date);
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Termine',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termine nach Status abrufen
  async getAppointmentsByStatus(req: Request, res: Response) {
    try {
      const appointments = await appointmentService.findByStatus(req.params.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show');
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Termine',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termine nach Datum und Arzt abrufen
  async getAppointmentsByDateAndDoctor(req: Request, res: Response) {
    try {
      const date = new Date(req.params.date);
      const appointments = await appointmentService.findByDateAndDoctor(date, req.params.doctorId);
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Termine',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termine nach Datum und Patient abrufen
  async getAppointmentsByDateAndPatient(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const date = new Date(req.params.date);
      const appointments = await appointmentService.findByDateAndPatient(date, user._id.toString());
      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Abrufen der Termine',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termin aktualisieren
  async updateAppointment(req: Request, res: Response) {
    try {
      const appointmentData: UpdateAppointmentDto = req.body;
      const appointment = await appointmentService.updateAppointment(req.params.id, appointmentData);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Termin nicht gefunden'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Aktualisieren des Termins',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Terminstatus aktualisieren
  async updateAppointmentStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const appointment = await appointmentService.updateStatus(req.params.id, status);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Termin nicht gefunden'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Aktualisieren des Terminstatus',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Termin löschen
  async deleteAppointment(req: Request, res: Response) {
    try {
      const appointment = await appointmentService.deleteAppointment(req.params.id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Termin nicht gefunden'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Termin erfolgreich gelöscht'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Löschen des Termins',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }

  // Verfügbarkeit prüfen
  async checkAvailability(req: Request, res: Response) {
    try {
      const { doctorId, date, time, duration } = req.body;
      const isAvailable = await appointmentService.checkAvailability(
        doctorId,
        new Date(date),
        time,
        duration || 30
      );

      res.status(200).json({
        success: true,
        data: { isAvailable }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Fehler beim Prüfen der Verfügbarkeit',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    }
  }
}

export default new AppointmentController(); 