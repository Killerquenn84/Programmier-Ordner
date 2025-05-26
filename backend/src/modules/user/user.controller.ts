import { Request, Response } from 'express';
import userService, { CreateUserDto, UpdateUserDto } from './user.service';
import { checkRole } from '../../middleware/auth';

export class UserController {
  // Benutzer registrieren
  async register(req: Request, res: Response) {
    try {
      const userData: CreateUserDto = req.body;
      const user = await userService.createUser(userData);
      res.status(201).json({
        message: 'Benutzer erfolgreich erstellt',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      res.status(400).json({
        message: 'Fehler bei der Benutzerregistrierung',
        error: (error as Error).message
      });
    }
  }

  // Benutzer anmelden
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await userService.authenticate(email, password);
      
      if (!result) {
        return res.status(401).json({
          message: 'Ungültige Anmeldedaten'
        });
      }

      res.json({
        message: 'Anmeldung erfolgreich',
        token: result.token,
        user: {
          id: result.user._id,
          email: result.user.email,
          role: result.user.role,
          firstName: result.user.firstName,
          lastName: result.user.lastName
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler bei der Anmeldung',
        error: (error as Error).message
      });
    }
  }

  // Benutzerprofil abrufen
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await userService.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Benutzer nicht gefunden'
        });
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen des Profils',
        error: (error as Error).message
      });
    }
  }

  // Benutzerprofil aktualisieren
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const userData: UpdateUserDto = req.body;
      const user = await userService.updateUser(userId, userData);
      
      if (!user) {
        return res.status(404).json({
          message: 'Benutzer nicht gefunden'
        });
      }

      res.json({
        message: 'Profil erfolgreich aktualisiert',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren des Profils',
        error: (error as Error).message
      });
    }
  }

  // Alle Benutzer abrufen (nur Admin)
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.findAll();
      res.json({
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }))
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Abrufen der Benutzer',
        error: (error as Error).message
      });
    }
  }

  // Benutzer deaktivieren (nur Admin)
  async deactivateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await userService.deactivateUser(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'Benutzer nicht gefunden'
        });
      }

      res.json({
        message: 'Benutzer erfolgreich deaktiviert',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Fehler beim Deaktivieren des Benutzers',
        error: (error as Error).message
      });
    }
  }
}

export default new UserController(); 