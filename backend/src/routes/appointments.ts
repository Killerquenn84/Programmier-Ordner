import express from 'express';
import { auth } from '../middleware/auth';
import {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  confirmAppointment,
  rejectAppointment
} from '../controllers/appointmentController';

const router = express.Router();

// Termin erstellen (öffentlich, für Patienten)
router.post('/', createAppointment);

// Termine eines Patienten abrufen (öffentlich)
router.get('/', getPatientAppointments);

// Termine eines Arztes abrufen (geschützt)
router.get('/doctor/:doctorId', auth, getDoctorAppointments);

// Termin bestätigen (geschützt, nur für Ärzte)
router.post('/:appointmentId/confirm', auth, confirmAppointment);

// Termin ablehnen (geschützt, nur für Ärzte)
router.post('/:appointmentId/reject', auth, rejectAppointment);

export default router; 