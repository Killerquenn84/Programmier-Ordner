import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../user/user.model';

export interface IPatient extends Document {
  userId: IUser['_id'];
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'diverse';
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  phoneNumber: string;
  insuranceNumber: string;
  insuranceProvider: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    surgeries: string[];
  };
  consent: {
    dataProcessing: boolean;
    marketing: boolean;
    research: boolean;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'diverse'],
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    houseNumber: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Deutschland'
    }
  },
  phoneNumber: {
    type: String,
    required: true
  },
  insuranceNumber: {
    type: String,
    required: true
  },
  insuranceProvider: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  },
  medicalHistory: {
    conditions: [String],
    allergies: [String],
    medications: [String],
    surgeries: [String]
  },
  consent: {
    dataProcessing: {
      type: Boolean,
      required: true,
      default: false
    },
    marketing: {
      type: Boolean,
      required: true,
      default: false
    },
    research: {
      type: Boolean,
      required: true,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indizes für häufig abgefragte Felder
patientSchema.index({ userId: 1 });
patientSchema.index({ insuranceNumber: 1 });
patientSchema.index({ 'address.postalCode': 1 });

// Prüfen, ob das Modell bereits existiert
const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);

export default Patient; 