import { Request, Response } from 'express';
import patientService, { CreatePatientDto, UpdatePatientDto } from './patient.service';
import { checkRole } from '../../middleware/auth';

export class PatientController {
  // Patient erstellen
  async createPatient(req: Request, res: Response) {
    try {
      const patientData: CreatePatientDto = req.body;
      const patient = await patientService.createPatient(patientData);
      res.status(201).json({
        message: 'Patient erfolgreich erstellt',
        patient
      });
    } catch (error) {
      res.status(400).json({
        message: 'Fehler bei der Patientenregistrierung',
        error: (error as Error).message
      });
    }
  }

  // Patient nach ID abrufen
  async getPatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await patientService.findById(id);
      
      if (!patient) {
        return res.status(404).json({
          message: 'Patient nicht gefunden'
        });
      }

      res.json({ patient });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen des Patienten',
        error: (error as Error).message
      });
    }
  }

  // Patient nach User-ID abrufen
  async getPatientByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const patient = await patientService.findByUserId(userId);
      
      if (!patient) {
        return res.status(404).json({
          message: 'Patient nicht gefunden'
        });
      }

      res.json({ patient });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen des Patienten',
        error: (error as Error).message
      });
    }
  }

  // Alle Patienten abrufen
  async getAllPatients(req: Request, res: Response) {
    try {
      const patients = await patientService.findAll();
      res.json({ patients });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen der Patienten',
        error: (error as Error).message
      });
    }
  }

  // Patienten nach Postleitzahl filtern
  async getPatientsByPostalCode(req: Request, res: Response) {
    try {
      const { postalCode } = req.params;
      const patients = await patientService.findByPostalCode(postalCode);
      res.json({ patients });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Filtern der Patienten',
        error: (error as Error).message
      });
    }
  }

  // Patienten nach Versicherungsnummer filtern
  async getPatientsByInsuranceNumber(req: Request, res: Response) {
    try {
      const { insuranceNumber } = req.params;
      const patients = await patientService.findByInsuranceNumber(insuranceNumber);
      res.json({ patients });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Filtern der Patienten',
        error: (error as Error).message
      });
    }
  }

  // Patient aktualisieren
  async updatePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patientData: UpdatePatientDto = req.body;
      const patient = await patientService.updatePatient(id, patientData);
      
      if (!patient) {
        return res.status(404).json({
          message: 'Patient nicht gefunden'
        });
      }

      res.json({
        message: 'Patient erfolgreich aktualisiert',
        patient
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren des Patienten',
        error: (error as Error).message
      });
    }
  }

  // Einwilligungen aktualisieren
  async updateConsent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const consentData = req.body;
      const patient = await patientService.updateConsent(id, consentData);
      
      if (!patient) {
        return res.status(404).json({
          message: 'Patient nicht gefunden'
        });
      }

      res.json({
        message: 'Einwilligungen erfolgreich aktualisiert',
        patient
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren der Einwilligungen',
        error: (error as Error).message
      });
    }
  }

  // Medizinische Historie aktualisieren
  async updateMedicalHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const medicalHistoryData = req.body;
      const patient = await patientService.updateMedicalHistory(id, medicalHistoryData);
      
      if (!patient) {
        return res.status(404).json({
          message: 'Patient nicht gefunden'
        });
      }

      res.json({
        message: 'Medizinische Historie erfolgreich aktualisiert',
        patient
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren der medizinischen Historie',
        error: (error as Error).message
      });
    }
  }

  // Patient löschen
  async deletePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await patientService.deletePatient(id);
      
      if (!patient) {
        return res.status(404).json({
          message: 'Patient nicht gefunden'
        });
      }

      res.json({
        message: 'Patient erfolgreich gelöscht',
        patient
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Löschen des Patienten',
        error: (error as Error).message
      });
    }
  }
}

export default new PatientController(); 