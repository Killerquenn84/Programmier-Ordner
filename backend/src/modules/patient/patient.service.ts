import Patient, { IPatient } from './patient.model';
import { Types } from 'mongoose';

export interface CreatePatientDto {
  userId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'diverse';
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country?: string;
  };
  phoneNumber: string;
  insuranceNumber: string;
  insuranceProvider: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalHistory?: {
    conditions?: string[];
    allergies?: string[];
    medications?: string[];
    surgeries?: string[];
  };
  consent?: {
    dataProcessing: boolean;
    marketing: boolean;
    research: boolean;
  };
}

export interface UpdatePatientDto {
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'diverse';
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  phoneNumber?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  medicalHistory?: {
    conditions?: string[];
    allergies?: string[];
    medications?: string[];
    surgeries?: string[];
  };
  consent?: {
    dataProcessing?: boolean;
    marketing?: boolean;
    research?: boolean;
  };
}

export class PatientService {
  // Patient erstellen
  async createPatient(patientData: CreatePatientDto): Promise<IPatient> {
    const patient = new Patient({
      ...patientData,
      userId: new Types.ObjectId(patientData.userId),
      consent: {
        ...patientData.consent,
        lastUpdated: new Date()
      }
    });
    return patient.save();
  }

  // Patient nach ID finden
  async findById(id: string): Promise<IPatient | null> {
    return Patient.findById(id).populate('userId');
  }

  // Patient nach User-ID finden
  async findByUserId(userId: string): Promise<IPatient | null> {
    return Patient.findOne({ userId: new Types.ObjectId(userId) }).populate('userId');
  }

  // Alle Patienten abrufen
  async findAll(): Promise<IPatient[]> {
    return Patient.find().populate('userId');
  }

  // Patienten nach Postleitzahl filtern
  async findByPostalCode(postalCode: string): Promise<IPatient[]> {
    return Patient.find({ 'address.postalCode': postalCode }).populate('userId');
  }

  // Patienten nach Versicherungsnummer filtern
  async findByInsuranceNumber(insuranceNumber: string): Promise<IPatient[]> {
    return Patient.find({ insuranceNumber }).populate('userId');
  }

  // Patient aktualisieren
  async updatePatient(id: string, patientData: UpdatePatientDto): Promise<IPatient | null> {
    const updateData = {
      ...patientData,
      'consent.lastUpdated': new Date()
    };
    return Patient.findByIdAndUpdate(id, updateData, { new: true }).populate('userId');
  }

  // Einwilligungen aktualisieren
  async updateConsent(id: string, consentData: {
    dataProcessing?: boolean;
    marketing?: boolean;
    research?: boolean;
  }): Promise<IPatient | null> {
    return Patient.findByIdAndUpdate(
      id,
      {
        consent: {
          ...consentData,
          lastUpdated: new Date()
        }
      },
      { new: true }
    ).populate('userId');
  }

  // Medizinische Historie aktualisieren
  async updateMedicalHistory(id: string, medicalHistoryData: {
    conditions?: string[];
    allergies?: string[];
    medications?: string[];
    surgeries?: string[];
  }): Promise<IPatient | null> {
    return Patient.findByIdAndUpdate(
      id,
      { medicalHistory: medicalHistoryData },
      { new: true }
    ).populate('userId');
  }

  // Patient löschen
  async deletePatient(id: string): Promise<IPatient | null> {
    return Patient.findByIdAndDelete(id);
  }
}

export default new PatientService(); 