import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  date: Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  description: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema({
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
    min: 15,
    max: 180
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
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

// Prüfe, ob das Modell bereits existiert
export const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema); 