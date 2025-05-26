import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../user/user.model';
import { IDoctor } from '../doctor/doctor.model';
import { IPatient } from '../patient/patient.model';

export interface IAppointment extends Document {
  date: Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  doctorId: IDoctor['_id'];
  patientId: IPatient['_id'];
  description: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // Standarddauer in Minuten
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indizes für häufig abgefragte Felder
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, doctorId: 1 });
appointmentSchema.index({ date: 1, patientId: 1 });

// Prüfen, ob das Modell bereits existiert
const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment; 