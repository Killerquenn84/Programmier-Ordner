import Doctor, { IDoctor } from './doctor.model';
import { Types } from 'mongoose';

export interface CreateDoctorDto {
  userId: string;
  specialization: string;
  title: string;
  licenseNumber: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country?: string;
  };
  phoneNumber: string;
  email: string;
  availability?: {
    monday?: { start: string; end: string; isAvailable: boolean }[];
    tuesday?: { start: string; end: string; isAvailable: boolean }[];
    wednesday?: { start: string; end: string; isAvailable: boolean }[];
    thursday?: { start: string; end: string; isAvailable: boolean }[];
    friday?: { start: string; end: string; isAvailable: boolean }[];
    saturday?: { start: string; end: string; isAvailable: boolean }[];
    sunday?: { start: string; end: string; isAvailable: boolean }[];
  };
  vacation?: {
    start: Date;
    end: Date;
    reason: string;
  }[];
}

export interface UpdateDoctorDto {
  specialization?: string;
  title?: string;
  licenseNumber?: string;
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  phoneNumber?: string;
  email?: string;
  availability?: {
    monday?: { start: string; end: string; isAvailable: boolean }[];
    tuesday?: { start: string; end: string; isAvailable: boolean }[];
    wednesday?: { start: string; end: string; isAvailable: boolean }[];
    thursday?: { start: string; end: string; isAvailable: boolean }[];
    friday?: { start: string; end: string; isAvailable: boolean }[];
    saturday?: { start: string; end: string; isAvailable: boolean }[];
    sunday?: { start: string; end: string; isAvailable: boolean }[];
  };
  vacation?: {
    start: Date;
    end: Date;
    reason: string;
  }[];
}

export class DoctorService {
  // Arzt erstellen
  async createDoctor(doctorData: CreateDoctorDto): Promise<IDoctor> {
    const doctor = new Doctor({
      ...doctorData,
      userId: new Types.ObjectId(doctorData.userId)
    });
    return doctor.save();
  }

  // Arzt nach ID finden
  async findById(id: string): Promise<IDoctor | null> {
    return Doctor.findById(id).populate('userId');
  }

  // Arzt nach User-ID finden
  async findByUserId(userId: string): Promise<IDoctor | null> {
    return Doctor.findOne({ userId: new Types.ObjectId(userId) }).populate('userId');
  }

  // Alle Ärzte abrufen
  async findAll(): Promise<IDoctor[]> {
    return Doctor.find().populate('userId');
  }

  // Ärzte nach Spezialisierung filtern
  async findBySpecialization(specialization: string): Promise<IDoctor[]> {
    return Doctor.find({ specialization }).populate('userId');
  }

  // Ärzte nach Postleitzahl filtern
  async findByPostalCode(postalCode: string): Promise<IDoctor[]> {
    return Doctor.find({ 'address.postalCode': postalCode }).populate('userId');
  }

  // Arzt aktualisieren
  async updateDoctor(id: string, doctorData: UpdateDoctorDto): Promise<IDoctor | null> {
    return Doctor.findByIdAndUpdate(id, doctorData, { new: true }).populate('userId');
  }

  // Verfügbarkeit aktualisieren
  async updateAvailability(id: string, availability: {
    monday?: { start: string; end: string; isAvailable: boolean }[];
    tuesday?: { start: string; end: string; isAvailable: boolean }[];
    wednesday?: { start: string; end: string; isAvailable: boolean }[];
    thursday?: { start: string; end: string; isAvailable: boolean }[];
    friday?: { start: string; end: string; isAvailable: boolean }[];
    saturday?: { start: string; end: string; isAvailable: boolean }[];
    sunday?: { start: string; end: string; isAvailable: boolean }[];
  }): Promise<IDoctor | null> {
    return Doctor.findByIdAndUpdate(
      id,
      { availability },
      { new: true }
    ).populate('userId');
  }

  // Urlaub hinzufügen
  async addVacation(id: string, vacation: {
    start: Date;
    end: Date;
    reason: string;
  }): Promise<IDoctor | null> {
    return Doctor.findByIdAndUpdate(
      id,
      { $push: { vacation } },
      { new: true }
    ).populate('userId');
  }

  // Urlaub entfernen
  async removeVacation(id: string, vacationId: string): Promise<IDoctor | null> {
    return Doctor.findByIdAndUpdate(
      id,
      { $pull: { vacation: { _id: vacationId } } },
      { new: true }
    ).populate('userId');
  }

  // Arzt löschen
  async deleteDoctor(id: string): Promise<IDoctor | null> {
    return Doctor.findByIdAndDelete(id);
  }
}

export default new DoctorService(); 