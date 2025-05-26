import { Router } from 'express';
import doctorController from './doctor.controller';
import { authenticateToken, isAdmin, isDoctor } from '../../middleware/auth';

const router = Router();

// Öffentliche Routen
router.post('/', authenticateToken, doctorController.createDoctor);

// Geschützte Routen für Ärzte
router.get('/profile', authenticateToken, doctorController.getDoctorByUserId);
router.put('/profile', authenticateToken, doctorController.updateDoctor);
router.put('/profile/availability', authenticateToken, doctorController.updateAvailability);
router.post('/profile/vacation', authenticateToken, doctorController.addVacation);
router.delete('/profile/vacation/:vacationId', authenticateToken, doctorController.removeVacation);

// Geschützte Routen für Patienten
router.get('/', authenticateToken, doctorController.getAllDoctors);
router.get('/specialization/:specialization', authenticateToken, doctorController.getDoctorsBySpecialization);
router.get('/postal-code/:postalCode', authenticateToken, doctorController.getDoctorsByPostalCode);
router.get('/:id', authenticateToken, doctorController.getDoctor);

// Admin-Routen
router.delete('/:id', authenticateToken, isAdmin, doctorController.deleteDoctor);

export default router; 