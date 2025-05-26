import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  patientGeburtsdatum: {
    type: String,
    required: true
  },
  arztId: {
    type: String,
    required: true
  },
  datum: {
    type: String,
    required: true
  },
  uhrzeit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['angefragt', 'bestätigt', 'abgelehnt', 'abgesagt'],
    default: 'angefragt'
  },
  kommentar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 