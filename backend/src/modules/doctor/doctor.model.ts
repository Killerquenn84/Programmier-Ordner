import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../user/user.model';

export interface IDoctor extends Document {
  userId: IUser['_id'];
  specialization: string;
  title: string;
  licenseNumber: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  phoneNumber: string;
  email: string;
  availability: {
    monday: { start: string; end: string; isAvailable: boolean }[];
    tuesday: { start: string; end: string; isAvailable: boolean }[];
    wednesday: { start: string; end: string; isAvailable: boolean }[];
    thursday: { start: string; end: string; isAvailable: boolean }[];
    friday: { start: string; end: string; isAvailable: boolean }[];
    saturday: { start: string; end: string; isAvailable: boolean }[];
    sunday: { start: string; end: string; isAvailable: boolean }[];
  };
  vacation: {
    start: Date;
    end: Date;
    reason: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
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
  email: {
    type: String,
    required: true
  },
  availability: {
    monday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }],
    tuesday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }],
    wednesday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }],
    thursday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }],
    friday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }],
    saturday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }],
    sunday: [{
      start: String,
      end: String,
      isAvailable: Boolean
    }]
  },
  vacation: [{
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Indizes für häufig abgefragte Felder
doctorSchema.index({ userId: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'address.postalCode': 1 });

// Prüfen, ob das Modell bereits existiert
const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor; 