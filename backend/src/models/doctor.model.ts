import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDoctor extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'doctor';
  specialization: string;
  licenseNumber: string;
  availability: {
    monday: { start: string; end: string }[];
    tuesday: { start: string; end: string }[];
    wednesday: { start: string; end: string }[];
    thursday: { start: string; end: string }[];
    friday: { start: string; end: string }[];
  };
  vacation: {
    start: Date;
    end: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const doctorSchema = new Schema<IDoctor>({
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
    enum: ['doctor'],
    default: 'doctor'
  },
  specialization: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  availability: {
    monday: [{
      start: String,
      end: String
    }],
    tuesday: [{
      start: String,
      end: String
    }],
    wednesday: [{
      start: String,
      end: String
    }],
    thursday: [{
      start: String,
      end: String
    }],
    friday: [{
      start: String,
      end: String
    }]
  },
  vacation: [{
    start: Date,
    end: Date
  }]
}, {
  timestamps: true
});

// Passwort-Hashing vor dem Speichern
doctorSchema.pre('save', async function(next) {
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
doctorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indizes
doctorSchema.index({ email: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialization: 1 });

// Prüfen, ob das Modell bereits existiert
const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor; 