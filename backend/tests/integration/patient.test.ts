import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import Patient from '../../src/modules/patient/patient.model';
import User from '../../src/modules/user/user.model';
import { CreatePatientDto } from '../../src/modules/patient/patient.service';

describe('Patient Integration Tests', () => {
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let patientId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Patient.deleteMany({});
    await User.deleteMany({});

    // Admin-Benutzer erstellen
    const adminResponse = await request(app)
      .post('/api/users/register')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User'
      });
    adminToken = adminResponse.body.token;

    // Arzt-Benutzer erstellen
    const doctorResponse = await request(app)
      .post('/api/users/register')
      .send({
        email: 'doctor@example.com',
        password: 'doctor123',
        role: 'doctor',
        firstName: 'Dr.',
        lastName: 'Medicus'
      });
    doctorToken = doctorResponse.body.token;

    // Patient-Benutzer erstellen
    const patientResponse = await request(app)
      .post('/api/users/register')
      .send({
        email: 'patient@example.com',
        password: 'patient123',
        role: 'patient',
        firstName: 'Max',
        lastName: 'Mustermann'
      });
    patientToken = patientResponse.body.token;
    patientId = patientResponse.body.user.id;
  });

  describe('Patientenregistrierung', () => {
    it('sollte einen neuen Patienten registrieren', async () => {
      const patientData: CreatePatientDto = {
        userId: patientId,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt',
          country: 'Deutschland'
        },
        phoneNumber: '+49123456789',
        insuranceNumber: '123456789',
        insuranceProvider: 'AOK',
        emergencyContact: {
          name: 'Maria Mustermann',
          relationship: 'Ehefrau',
          phoneNumber: '+49987654321'
        },
        consent: {
          dataProcessing: true,
          marketing: false,
          research: false
        }
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(patientData);

      expect(response.status).toBe(201);
      expect(response.body.patient).toBeDefined();
      expect(response.body.patient.userId).toBe(patientId);
    });

    it('sollte einen Fehler bei doppelter Registrierung werfen', async () => {
      const patientData: CreatePatientDto = {
        userId: patientId,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        insuranceNumber: '123456789',
        insuranceProvider: 'AOK',
        emergencyContact: {
          name: 'Maria Mustermann',
          relationship: 'Ehefrau',
          phoneNumber: '+49987654321'
        }
      };

      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(patientData);

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(patientData);

      expect(response.status).toBe(400);
    });
  });

  describe('Profilverwaltung', () => {
    beforeEach(async () => {
      // Test-Patient erstellen
      const patientData: CreatePatientDto = {
        userId: patientId,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        insuranceNumber: '123456789',
        insuranceProvider: 'AOK',
        emergencyContact: {
          name: 'Maria Mustermann',
          relationship: 'Ehefrau',
          phoneNumber: '+49987654321'
        }
      };

      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(patientData);
    });

    it('sollte das eigene Profil abrufen können', async () => {
      const response = await request(app)
        .get('/api/patients/profile')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.patient).toBeDefined();
      expect(response.body.patient.userId).toBe(patientId);
    });

    it('sollte das eigene Profil aktualisieren können', async () => {
      const response = await request(app)
        .put('/api/patients/profile')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          phoneNumber: '+49987654321'
        });

      expect(response.status).toBe(200);
      expect(response.body.patient.phoneNumber).toBe('+49987654321');
    });

    it('sollte die Einwilligungen aktualisieren können', async () => {
      const response = await request(app)
        .put('/api/patients/profile/consent')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          marketing: true
        });

      expect(response.status).toBe(200);
      expect(response.body.patient.consent.marketing).toBe(true);
    });
  });

  describe('Arzt-Funktionen', () => {
    beforeEach(async () => {
      // Test-Patient erstellen
      const patientData: CreatePatientDto = {
        userId: patientId,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        insuranceNumber: '123456789',
        insuranceProvider: 'AOK',
        emergencyContact: {
          name: 'Maria Mustermann',
          relationship: 'Ehefrau',
          phoneNumber: '+49987654321'
        }
      };

      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(patientData);
    });

    it('sollte alle Patienten abrufen können', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body.patients.length).toBeGreaterThan(0);
    });

    it('sollte Patienten nach Postleitzahl filtern können', async () => {
      const response = await request(app)
        .get('/api/patients/postal-code/12345')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body.patients[0].address.postalCode).toBe('12345');
    });

    it('sollte Patienten nach Versicherungsnummer filtern können', async () => {
      const response = await request(app)
        .get('/api/patients/insurance/123456789')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.patients)).toBe(true);
      expect(response.body.patients[0].insuranceNumber).toBe('123456789');
    });

    it('sollte die medizinische Historie aktualisieren können', async () => {
      const response = await request(app)
        .put('/api/patients/profile/medical-history')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          conditions: ['Bluthochdruck'],
          allergies: ['Pollen']
        });

      expect(response.status).toBe(200);
      expect(response.body.patient.medicalHistory.conditions).toContain('Bluthochdruck');
      expect(response.body.patient.medicalHistory.allergies).toContain('Pollen');
    });
  });

  describe('Admin-Funktionen', () => {
    beforeEach(async () => {
      // Test-Patient erstellen
      const patientData: CreatePatientDto = {
        userId: patientId,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        insuranceNumber: '123456789',
        insuranceProvider: 'AOK',
        emergencyContact: {
          name: 'Maria Mustermann',
          relationship: 'Ehefrau',
          phoneNumber: '+49987654321'
        }
      };

      await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(patientData);
    });

    it('sollte einen Patienten löschen können', async () => {
      const response = await request(app)
        .delete('/api/patients/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.patient).toBeDefined();

      const getResponse = await request(app)
        .get('/api/patients/profile')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
}); 