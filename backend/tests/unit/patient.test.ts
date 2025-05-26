import mongoose from 'mongoose';
import patientService, { CreatePatientDto } from '../../src/modules/patient/patient.service';
import Patient from '../../src/modules/patient/patient.model';
import User from '../../src/modules/user/user.model';

describe('Patient Service Tests', () => {
  let userId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arztpraxis-test');
    
    // Test-User erstellen
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'patient',
      firstName: 'Max',
      lastName: 'Mustermann'
    });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Patient.deleteMany({});
  });

  describe('Patient erstellen', () => {
    it('sollte einen neuen Patienten erstellen', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      const patient = await patientService.createPatient(patientData);

      expect(patient).toBeDefined();
      expect(patient.userId.toString()).toBe(userId);
      expect(patient.dateOfBirth).toEqual(patientData.dateOfBirth);
      expect(patient.gender).toBe(patientData.gender);
      expect(patient.address).toEqual(patientData.address);
      expect(patient.phoneNumber).toBe(patientData.phoneNumber);
      expect(patient.insuranceNumber).toBe(patientData.insuranceNumber);
      expect(patient.insuranceProvider).toBe(patientData.insuranceProvider);
      expect(patient.emergencyContact).toEqual(patientData.emergencyContact);
      expect(patient.consent.dataProcessing).toBe(patientData.consent.dataProcessing);
      expect(patient.consent.marketing).toBe(patientData.consent.marketing);
      expect(patient.consent.research).toBe(patientData.consent.research);
    });

    it('sollte einen Fehler werfen bei doppelter User-ID', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      await patientService.createPatient(patientData);

      await expect(patientService.createPatient(patientData)).rejects.toThrow();
    });
  });

  describe('Patient finden', () => {
    it('sollte einen Patienten nach ID finden', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      const createdPatient = await patientService.createPatient(patientData);
      const foundPatient = await patientService.findById(createdPatient._id.toString());

      expect(foundPatient).toBeDefined();
      expect(foundPatient?._id.toString()).toBe(createdPatient._id.toString());
    });

    it('sollte einen Patienten nach User-ID finden', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      await patientService.createPatient(patientData);
      const foundPatient = await patientService.findByUserId(userId);

      expect(foundPatient).toBeDefined();
      expect(foundPatient?.userId.toString()).toBe(userId);
    });
  });

  describe('Patient aktualisieren', () => {
    it('sollte einen Patienten erfolgreich aktualisieren', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      const patient = await patientService.createPatient(patientData);
      const updatedPatient = await patientService.updatePatient(patient._id.toString(), {
        phoneNumber: '+49987654321'
      });

      expect(updatedPatient).toBeDefined();
      expect(updatedPatient?.phoneNumber).toBe('+49987654321');
    });

    it('sollte die Einwilligungen erfolgreich aktualisieren', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      const patient = await patientService.createPatient(patientData);
      const updatedPatient = await patientService.updateConsent(patient._id.toString(), {
        marketing: true
      });

      expect(updatedPatient).toBeDefined();
      expect(updatedPatient?.consent.marketing).toBe(true);
    });

    it('sollte die medizinische Historie erfolgreich aktualisieren', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      const patient = await patientService.createPatient(patientData);
      const updatedPatient = await patientService.updateMedicalHistory(patient._id.toString(), {
        conditions: ['Bluthochdruck'],
        allergies: ['Pollen']
      });

      expect(updatedPatient).toBeDefined();
      expect(updatedPatient?.medicalHistory.conditions).toContain('Bluthochdruck');
      expect(updatedPatient?.medicalHistory.allergies).toContain('Pollen');
    });
  });

  describe('Patient löschen', () => {
    it('sollte einen Patienten erfolgreich löschen', async () => {
      const patientData: CreatePatientDto = {
        userId,
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

      const patient = await patientService.createPatient(patientData);
      const deletedPatient = await patientService.deletePatient(patient._id.toString());

      expect(deletedPatient).toBeDefined();
      expect(deletedPatient?._id.toString()).toBe(patient._id.toString());

      const foundPatient = await patientService.findById(patient._id.toString());
      expect(foundPatient).toBeNull();
    });
  });
}); 