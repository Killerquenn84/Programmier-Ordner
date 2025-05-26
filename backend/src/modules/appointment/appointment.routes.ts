import { Router } from 'express';
import appointmentController from './appointment.controller';
import { authenticate } from '../auth/auth.middleware';
import { authorize } from '../auth/auth.middleware';

const router = Router();

// Öffentliche Routen
router.post('/check-availability', appointmentController.checkAvailability);

// Geschützte Routen für Patienten
router.post('/', authenticate, authorize(['patient']), appointmentController.createAppointment);
router.get('/patient', authenticate, authorize(['patient']), appointmentController.getAppointmentsByPatient);
router.get('/patient/:date', authenticate, authorize(['patient']), appointmentController.getAppointmentsByDateAndPatient);

// Geschützte Routen für Ärzte
router.get('/doctor/:doctorId', authenticate, authorize(['doctor', 'admin']), appointmentController.getAppointmentsByDoctor);
router.get('/doctor/:doctorId/:date', authenticate, authorize(['doctor', 'admin']), appointmentController.getAppointmentsByDateAndDoctor);
router.patch('/:id/status', authenticate, authorize(['doctor', 'admin']), appointmentController.updateAppointmentStatus);

// Geschützte Routen für Admins
router.get('/status/:status', authenticate, authorize(['admin']), appointmentController.getAppointmentsByStatus);
router.delete('/:id', authenticate, authorize(['admin']), appointmentController.deleteAppointment);

// Gemeinsame geschützte Routen
router.get('/:id', authenticate, authorize(['patient', 'doctor', 'admin']), appointmentController.getAppointmentById);
router.get('/date/:date', authenticate, authorize(['patient', 'doctor', 'admin']), appointmentController.getAppointmentsByDate);
router.patch('/:id', authenticate, authorize(['patient', 'doctor', 'admin']), appointmentController.updateAppointment);

export default router; 