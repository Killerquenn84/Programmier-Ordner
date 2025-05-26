"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientData = exports.identifyPatient = void 0;
const Patient_1 = __importDefault(require("../models/Patient"));
// Patienten identifizieren oder erstellen
const identifyPatient = async (req, res) => {
    try {
        const { firstName, lastName, birthDate, address, phoneNumber, email } = req.body;
        // Suche nach existierendem Patienten
        const existingPatient = await Patient_1.default.findOne({
            firstName,
            lastName,
            birthDate: new Date(birthDate)
        });
        if (existingPatient) {
            // Patient existiert bereits
            return res.json({
                message: 'Patient identifiziert',
                patient: existingPatient,
                isNew: false
            });
        }
        // Neuen Patienten erstellen
        const newPatient = new Patient_1.default({
            firstName,
            lastName,
            birthDate: new Date(birthDate),
            address,
            phoneNumber,
            email
        });
        await newPatient.save();
        res.status(201).json({
            message: 'Neuer Patient erstellt',
            patient: newPatient,
            isNew: true
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler bei der Patientenidentifikation', error });
    }
};
exports.identifyPatient = identifyPatient;
// Patienten-Daten abrufen
const getPatientData = async (req, res) => {
    try {
        const { firstName, lastName, birthDate } = req.query;
        const patient = await Patient_1.default.findOne({
            firstName,
            lastName,
            birthDate: new Date(birthDate)
        });
        if (!patient) {
            return res.status(404).json({ message: 'Patient nicht gefunden' });
        }
        res.json({ patient });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler beim Abrufen der Patientendaten', error });
    }
};
exports.getPatientData = getPatientData;
//# sourceMappingURL=patientController.js.map