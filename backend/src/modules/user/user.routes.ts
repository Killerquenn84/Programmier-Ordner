import { Router } from 'express';
import userController from './user.controller';
import { authenticateToken, isAdmin } from '../../middleware/auth';

const router = Router();

// Öffentliche Routen
router.post('/register', userController.register);
router.post('/login', userController.login);

// Geschützte Routen
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

// Admin-Routen
router.get('/users', authenticateToken, isAdmin, userController.getAllUsers);
router.put('/users/:userId/deactivate', authenticateToken, isAdmin, userController.deactivateUser);

export default router; 