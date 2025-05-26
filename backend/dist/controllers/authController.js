"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginDoctor = exports.registerDoctor = void 0;
const Doctor_1 = __importDefault(require("../models/Doctor"));
const auth_1 = require("../middleware/auth");
// Arzt registrieren
const registerDoctor = async (req, res) => {
    try {
        const { email, password, firstName, lastName, specialization } = req.body;
        // Prüfen, ob Arzt bereits existiert
        const existingDoctor = await Doctor_1.default.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Arzt mit dieser E-Mail existiert bereits' });
        }
        // Neuen Arzt erstellen
        const doctor = new Doctor_1.default({
            email,
            password,
            firstName,
            lastName,
            specialization
        });
        await doctor.save();
        // Token generieren
        const token = (0, auth_1.generateToken)(doctor._id.toString());
        res.status(201).json({
            message: 'Arzt erfolgreich registriert',
            token,
            doctor: {
                id: doctor._id,
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler bei der Registrierung', error });
    }
};
exports.registerDoctor = registerDoctor;
// Arzt einloggen
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Arzt finden
        const doctor = await Doctor_1.default.findOne({ email });
        if (!doctor) {
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }
        // Passwort überprüfen
        const isMatch = await doctor.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }
        // Token generieren
        const token = (0, auth_1.generateToken)(doctor._id.toString());
        res.json({
            message: 'Erfolgreich eingeloggt',
            token,
            doctor: {
                id: doctor._id,
                email: doctor.email,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler beim Login', error });
    }
};
exports.loginDoctor = loginDoctor;
//# sourceMappingURL=authController.js.map