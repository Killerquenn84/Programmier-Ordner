import User, { IUser } from './user.model';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface CreateUserDto {
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'patient';
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export class UserService {
  // Benutzer erstellen
  async createUser(userData: CreateUserDto): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  // Benutzer nach ID finden
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  // Benutzer nach E-Mail finden
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  // Alle Benutzer abrufen
  async findAll(): Promise<IUser[]> {
    return User.find();
  }

  // Benutzer aktualisieren
  async updateUser(id: string, userData: UpdateUserDto): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, userData, { new: true });
  }

  // Benutzer deaktivieren
  async deactivateUser(id: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  // Benutzer löschen
  async deleteUser(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }

  // Authentifizierung
  async authenticate(email: string, password: string): Promise<{ user: IUser; token: string } | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.isActive) return null;

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    // Token generieren
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        sessionId: new Types.ObjectId().toString()
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Letzten Login aktualisieren
    user.lastLogin = new Date();
    await user.save();

    return { user, token };
  }

  // Token verifizieren
  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Ungültiger Token');
    }
  }
}

export default new UserService(); 