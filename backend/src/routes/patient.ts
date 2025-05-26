import express from 'express';
import { identifyPatient, getPatientData } from '../controllers/patientController';

const router = express.Router();

// Patienten identifizieren oder erstellen
router.post('/identify', identifyPatient);

// Patienten-Daten abrufen
router.get('/data', getPatientData);

export default router; 