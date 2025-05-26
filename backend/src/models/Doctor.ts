import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDoctor extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const doctorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
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

// Methode zum Passwort-Vergleich
doctorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor; 