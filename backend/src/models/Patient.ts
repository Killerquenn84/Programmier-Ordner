import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
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
    }
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtuelles Feld für den vollständigen Namen
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient; 