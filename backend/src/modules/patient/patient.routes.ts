import { Router } from 'express';
import patientController from './patient.controller';
import { authenticateToken, isAdmin, isDoctor } from '../../middleware/auth';

const router = Router();

// Öffentliche Routen
router.post('/', authenticateToken, patientController.createPatient);

// Geschützte Routen für Patienten
router.get('/profile', authenticateToken, patientController.getPatientByUserId);
router.put('/profile', authenticateToken, patientController.updatePatient);
router.put('/profile/consent', authenticateToken, patientController.updateConsent);

// Geschützte Routen für Ärzte
router.get('/', authenticateToken, isDoctor, patientController.getAllPatients);
router.get('/postal-code/:postalCode', authenticateToken, isDoctor, patientController.getPatientsByPostalCode);
router.get('/insurance/:insuranceNumber', authenticateToken, isDoctor, patientController.getPatientsByInsuranceNumber);
router.get('/:id', authenticateToken, isDoctor, patientController.getPatient);
router.put('/:id', authenticateToken, isDoctor, patientController.updatePatient);
router.put('/:id/medical-history', authenticateToken, isDoctor, patientController.updateMedicalHistory);

// Admin-Routen
router.delete('/:id', authenticateToken, isAdmin, patientController.deletePatient);

export default router; 