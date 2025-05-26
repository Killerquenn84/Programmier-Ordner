import { Request, Response } from 'express';
import doctorService, { CreateDoctorDto, UpdateDoctorDto } from './doctor.service';
import { checkRole } from '../../middleware/auth';

export class DoctorController {
  // Arzt erstellen
  async createDoctor(req: Request, res: Response) {
    try {
      const doctorData: CreateDoctorDto = req.body;
      const doctor = await doctorService.createDoctor(doctorData);
      res.status(201).json({
        message: 'Arzt erfolgreich erstellt',
        doctor
      });
    } catch (error) {
      res.status(400).json({
        message: 'Fehler bei der Arztregistrierung',
        error: (error as Error).message
      });
    }
  }

  // Arzt nach ID abrufen
  async getDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await doctorService.findById(id);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({ doctor });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen des Arztes',
        error: (error as Error).message
      });
    }
  }

  // Arzt nach User-ID abrufen
  async getDoctorByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const doctor = await doctorService.findByUserId(userId);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({ doctor });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen des Arztes',
        error: (error as Error).message
      });
    }
  }

  // Alle Ärzte abrufen
  async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await doctorService.findAll();
      res.json({ doctors });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen der Ärzte',
        error: (error as Error).message
      });
    }
  }

  // Ärzte nach Spezialisierung filtern
  async getDoctorsBySpecialization(req: Request, res: Response) {
    try {
      const { specialization } = req.params;
      const doctors = await doctorService.findBySpecialization(specialization);
      res.json({ doctors });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Filtern der Ärzte',
        error: (error as Error).message
      });
    }
  }

  // Ärzte nach Postleitzahl filtern
  async getDoctorsByPostalCode(req: Request, res: Response) {
    try {
      const { postalCode } = req.params;
      const doctors = await doctorService.findByPostalCode(postalCode);
      res.json({ doctors });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Filtern der Ärzte',
        error: (error as Error).message
      });
    }
  }

  // Arzt aktualisieren
  async updateDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctorData: UpdateDoctorDto = req.body;
      const doctor = await doctorService.updateDoctor(id, doctorData);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({
        message: 'Arzt erfolgreich aktualisiert',
        doctor
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren des Arztes',
        error: (error as Error).message
      });
    }
  }

  // Verfügbarkeit aktualisieren
  async updateAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const availability = req.body;
      const doctor = await doctorService.updateAvailability(id, availability);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({
        message: 'Verfügbarkeit erfolgreich aktualisiert',
        doctor
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren der Verfügbarkeit',
        error: (error as Error).message
      });
    }
  }

  // Urlaub hinzufügen
  async addVacation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vacation = req.body;
      const doctor = await doctorService.addVacation(id, vacation);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({
        message: 'Urlaub erfolgreich hinzugefügt',
        doctor
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Hinzufügen des Urlaubs',
        error: (error as Error).message
      });
    }
  }

  // Urlaub entfernen
  async removeVacation(req: Request, res: Response) {
    try {
      const { id, vacationId } = req.params;
      const doctor = await doctorService.removeVacation(id, vacationId);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({
        message: 'Urlaub erfolgreich entfernt',
        doctor
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Entfernen des Urlaubs',
        error: (error as Error).message
      });
    }
  }

  // Arzt löschen
  async deleteDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await doctorService.deleteDoctor(id);
      
      if (!doctor) {
        return res.status(404).json({
          message: 'Arzt nicht gefunden'
        });
      }

      res.json({
        message: 'Arzt erfolgreich gelöscht',
        doctor
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Löschen des Arztes',
        error: (error as Error).message
      });
    }
  }
}

export default new DoctorController(); 