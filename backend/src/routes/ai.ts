import express from 'express';
import { suggestAppointments, chatWithBot } from '../controllers/aiController';

const router = express.Router();

// KI-gestützte Terminvorschläge
router.post('/suggest-appointments', suggestAppointments);

// Chatbot für Termin-Fragen
router.post('/chat', chatWithBot);

export default router; 