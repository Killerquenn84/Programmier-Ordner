import express from 'express';
import { registerDoctor, loginDoctor } from '../controllers/authController';

const router = express.Router();

// Arzt registrieren
router.post('/register', registerDoctor);

// Arzt einloggen
router.post('/login', loginDoctor);

export default router; 