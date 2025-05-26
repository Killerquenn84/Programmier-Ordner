"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const patientSchema = new mongoose_1.default.Schema({
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
patientSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
const Patient = mongoose_1.default.model('Patient', patientSchema);
exports.default = Patient;
//# sourceMappingURL=Patient.js.map