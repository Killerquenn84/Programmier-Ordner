import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'patient';
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  insuranceNumber: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const patientSchema = new Schema<IPatient>({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient'],
    default: 'patient'
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  insuranceNumber: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Passwort-Hashing vor dem Speichern
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Passwort-Vergleichsmethode
patientSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indizes
patientSchema.index({ email: 1 });
patientSchema.index({ insuranceNumber: 1 });
patientSchema.index({ lastName: 1, firstName: 1 });

// Prüfen, ob das Modell bereits existiert
const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);

export default Patient; 