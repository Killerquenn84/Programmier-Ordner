import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../src/app';
import User from '../../src/modules/user/user.model';
import Doctor from '../../src/modules/doctor/doctor.model';
import { generateToken } from '../../src/utils/auth';

describe('Doctor Integration Tests', () => {
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let adminId: string;
  let doctorId: string;
  let patientId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Doctor.deleteMany({});

    // Admin erstellen
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });
    adminId = admin._id.toString();
    adminToken = generateToken(admin);

    // Arzt erstellen
    const doctor = await User.create({
      email: 'doctor@example.com',
      password: 'password123',
      role: 'doctor',
      firstName: 'Dr.',
      lastName: 'Medicus'
    });
    doctorId = doctor._id.toString();
    doctorToken = generateToken(doctor);

    // Patient erstellen
    const patient = await User.create({
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      firstName: 'Max',
      lastName: 'Mustermann'
    });
    patientId = patient._id.toString();
    patientToken = generateToken(patient);
  });

  describe('Arzt-Registrierung', () => {
    it('sollte einen neuen Arzt erfolgreich registrieren', async () => {
      const response = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: doctorId,
          specialization: 'Allgemeinmedizin',
          title: 'Dr. med.',
          licenseNumber: '123456789',
          address: {
            street: 'Musterstraße',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Musterstadt'
          },
          phoneNumber: '+49123456789',
          email: 'dr.medicus@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.specialization).toBe('Allgemeinmedizin');
    });

    it('sollte einen Fehler bei doppelter Registrierung werfen', async () => {
      await Doctor.create({
        userId: doctorId,
        specialization: 'Allgemeinmedizin',
        title: 'Dr. med.',
        licenseNumber: '123456789',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        email: 'dr.medicus@example.com'
      });

      const response = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: doctorId,
          specialization: 'Allgemeinmedizin',
          title: 'Dr. med.',
          licenseNumber: '123456789',
          address: {
            street: 'Musterstraße',
            houseNumber: '1',
            postalCode: '12345',
            city: 'Musterstadt'
          },
          phoneNumber: '+49123456789',
          email: 'dr.medicus@example.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Arzt-Profilverwaltung', () => {
    beforeEach(async () => {
      await Doctor.create({
        userId: doctorId,
        specialization: 'Allgemeinmedizin',
        title: 'Dr. med.',
        licenseNumber: '123456789',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        email: 'dr.medicus@example.com'
      });
    });

    it('sollte das Arztprofil abrufen können', async () => {
      const response = await request(app)
        .get('/api/doctors/profile')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.specialization).toBe('Allgemeinmedizin');
    });

    it('sollte das Arztprofil aktualisieren können', async () => {
      const response = await request(app)
        .put('/api/doctors/profile')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          phoneNumber: '+49987654321'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.phoneNumber).toBe('+49987654321');
    });

    it('sollte die Verfügbarkeit aktualisieren können', async () => {
      const response = await request(app)
        .put('/api/doctors/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          monday: [{ start: '10:00', end: '18:00', isAvailable: true }]
        });

      expect(response.status).toBe(200);
      expect(response.body.data.availability.monday[0].start).toBe('10:00');
      expect(response.body.data.availability.monday[0].end).toBe('18:00');
    });

    it('sollte Urlaub hinzufügen können', async () => {
      const response = await request(app)
        .post('/api/doctors/vacation')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          start: '2024-07-01',
          end: '2024-07-14',
          reason: 'Sommerurlaub'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.vacation[0].reason).toBe('Sommerurlaub');
    });
  });

  describe('Patient-Funktionalitäten', () => {
    beforeEach(async () => {
      await Doctor.create({
        userId: doctorId,
        specialization: 'Allgemeinmedizin',
        title: 'Dr. med.',
        licenseNumber: '123456789',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        email: 'dr.medicus@example.com'
      });
    });

    it('sollte alle Ärzte abrufen können', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('sollte Ärzte nach Fachrichtung filtern können', async () => {
      const response = await request(app)
        .get('/api/doctors/specialization/Allgemeinmedizin')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].specialization).toBe('Allgemeinmedizin');
    });

    it('sollte Ärzte nach Postleitzahl filtern können', async () => {
      const response = await request(app)
        .get('/api/doctors/postal-code/12345')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].address.postalCode).toBe('12345');
    });
  });

  describe('Admin-Funktionalitäten', () => {
    let doctorDocId: string;

    beforeEach(async () => {
      const doctor = await Doctor.create({
        userId: doctorId,
        specialization: 'Allgemeinmedizin',
        title: 'Dr. med.',
        licenseNumber: '123456789',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt'
        },
        phoneNumber: '+49123456789',
        email: 'dr.medicus@example.com'
      });
      doctorDocId = doctor._id.toString();
    });

    it('sollte einen Arzt löschen können', async () => {
      const response = await request(app)
        .delete(`/api/doctors/${doctorDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const deletedDoctor = await Doctor.findById(doctorDocId);
      expect(deletedDoctor).toBeNull();
    });
  });
}); 