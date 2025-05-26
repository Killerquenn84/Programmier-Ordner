"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const appointmentSchema = new mongoose_1.default.Schema({
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
const Appointment = mongoose_1.default.model('Appointment', appointmentSchema);
exports.default = Appointment;
//# sourceMappingURL=Appointment.js.map