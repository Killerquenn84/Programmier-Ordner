import mongoose from 'mongoose';
import doctorService, { CreateDoctorDto } from '../../src/modules/doctor/doctor.service';
import Doctor from '../../src/modules/doctor/doctor.model';
import User from '../../src/modules/user/user.model';

describe('Doctor Service Tests', () => {
  let userId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis-test');
    
    // Test-User erstellen
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'doctor',
      firstName: 'Dr.',
      lastName: 'Medicus'
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Doctor.deleteMany({});
  });

  describe('Arzt erstellen', () => {
    it('sollte einen neuen Arzt erstellen', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
        specialization: 'Allgemeinmedizin',
        title: 'Dr. med.',
        licenseNumber: '123456789',
        address: {
          street: 'Musterstraße',
          houseNumber: '1',
          postalCode: '12345',
          city: 'Musterstadt',
          country: 'Deutschland'
        },
        phoneNumber: '+49123456789',
        email: 'dr.medicus@example.com',
        availability: {
          monday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          tuesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          wednesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          thursday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          friday: [{ start: '09:00', end: '17:00', isAvailable: true }]
        }
      };

      const doctor = await doctorService.createDoctor(doctorData);

      expect(doctor).toBeDefined();
      expect(doctor.userId.toString()).toBe(userId);
      expect(doctor.specialization).toBe(doctorData.specialization);
      expect(doctor.title).toBe(doctorData.title);
      expect(doctor.licenseNumber).toBe(doctorData.licenseNumber);
      expect(doctor.address).toEqual(doctorData.address);
      expect(doctor.phoneNumber).toBe(doctorData.phoneNumber);
      expect(doctor.email).toBe(doctorData.email);
      expect(doctor.availability.monday).toEqual(doctorData.availability?.monday);
    });

    it('sollte einen Fehler werfen bei doppelter User-ID', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      await doctorService.createDoctor(doctorData);

      await expect(doctorService.createDoctor(doctorData)).rejects.toThrow();
    });
  });

  describe('Arzt finden', () => {
    it('sollte einen Arzt nach ID finden', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      const createdDoctor = await doctorService.createDoctor(doctorData);
      const foundDoctor = await doctorService.findById(createdDoctor._id.toString());

      expect(foundDoctor).toBeDefined();
      expect(foundDoctor?._id.toString()).toBe(createdDoctor._id.toString());
    });

    it('sollte einen Arzt nach User-ID finden', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      await doctorService.createDoctor(doctorData);
      const foundDoctor = await doctorService.findByUserId(userId);

      expect(foundDoctor).toBeDefined();
      expect(foundDoctor?.userId.toString()).toBe(userId);
    });
  });

  describe('Arzt aktualisieren', () => {
    it('sollte einen Arzt erfolgreich aktualisieren', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      const doctor = await doctorService.createDoctor(doctorData);
      const updatedDoctor = await doctorService.updateDoctor(doctor._id.toString(), {
        phoneNumber: '+49987654321'
      });

      expect(updatedDoctor).toBeDefined();
      expect(updatedDoctor?.phoneNumber).toBe('+49987654321');
    });

    it('sollte die Verfügbarkeit erfolgreich aktualisieren', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      const doctor = await doctorService.createDoctor(doctorData);
      const updatedDoctor = await doctorService.updateAvailability(doctor._id.toString(), {
        monday: [{ start: '10:00', end: '18:00', isAvailable: true }]
      });

      expect(updatedDoctor).toBeDefined();
      expect(updatedDoctor?.availability.monday[0].start).toBe('10:00');
      expect(updatedDoctor?.availability.monday[0].end).toBe('18:00');
    });

    it('sollte Urlaub erfolgreich hinzufügen', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      const doctor = await doctorService.createDoctor(doctorData);
      const updatedDoctor = await doctorService.addVacation(doctor._id.toString(), {
        start: new Date('2024-07-01'),
        end: new Date('2024-07-14'),
        reason: 'Sommerurlaub'
      });

      expect(updatedDoctor).toBeDefined();
      expect(updatedDoctor?.vacation[0].reason).toBe('Sommerurlaub');
    });
  });

  describe('Arzt löschen', () => {
    it('sollte einen Arzt erfolgreich löschen', async () => {
      const doctorData: CreateDoctorDto = {
        userId,
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
      };

      const doctor = await doctorService.createDoctor(doctorData);
      const deletedDoctor = await doctorService.deleteDoctor(doctor._id.toString());

      expect(deletedDoctor).toBeDefined();
      expect(deletedDoctor?._id.toString()).toBe(doctor._id.toString());

      const foundDoctor = await doctorService.findById(doctor._id.toString());
      expect(foundDoctor).toBeNull();
    });
  });
}); 