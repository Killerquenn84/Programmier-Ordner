import mongoose from 'mongoose';
import userService, { CreateUserDto } from '../../src/modules/user/user.service';
import User from '../../src/modules/user/user.model';

describe('User Service Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Benutzer erstellen', () => {
    it('sollte einen neuen Benutzer erstellen', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      };

      const user = await userService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.password).not.toBe(userData.password); // Passwort sollte gehasht sein
    });

    it('sollte einen Fehler werfen bei doppelter E-Mail', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      };

      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow();
    });
  });

  describe('Benutzer authentifizieren', () => {
    it('sollte einen Benutzer erfolgreich authentifizieren', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      };

      await userService.createUser(userData);
      const result = await userService.authenticate(userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result?.user.email).toBe(userData.email);
      expect(result?.token).toBeDefined();
    });

    it('sollte einen Fehler bei falschem Passwort werfen', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      };

      await userService.createUser(userData);
      const result = await userService.authenticate(userData.email, 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('Benutzer aktualisieren', () => {
    it('sollte einen Benutzer erfolgreich aktualisieren', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      };

      const user = await userService.createUser(userData);
      const updatedUser = await userService.updateUser(user._id.toString(), {
        firstName: 'Updated',
        lastName: 'Name'
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.firstName).toBe('Updated');
      expect(updatedUser?.lastName).toBe('Name');
    });

    it('sollte einen Fehler bei nicht existierendem Benutzer werfen', async () => {
      const result = await userService.updateUser('nonexistentid', {
        firstName: 'Updated'
      });

      expect(result).toBeNull();
    });
  });

  describe('Benutzer deaktivieren', () => {
    it('sollte einen Benutzer erfolgreich deaktivieren', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      };

      const user = await userService.createUser(userData);
      const deactivatedUser = await userService.deactivateUser(user._id.toString());

      expect(deactivatedUser).toBeDefined();
      expect(deactivatedUser?.isActive).toBe(false);
    });

    it('sollte einen Fehler bei nicht existierendem Benutzer werfen', async () => {
      const result = await userService.deactivateUser('nonexistentid');

      expect(result).toBeNull();
    });
  });
}); 