"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectAppointment = exports.confirmAppointment = exports.getDoctorAppointments = exports.getPatientAppointments = exports.createAppointment = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
// Termin erstellen
const createAppointment = async (req, res) => {
    try {
        const { patientName, patientGeburtsdatum, arztId, datum, uhrzeit, kommentar } = req.body;
        const appointment = new Appointment_1.default({
            patientName,
            patientGeburtsdatum,
            arztId,
            datum,
            uhrzeit,
            kommentar,
            status: 'angefragt'
        });
        await appointment.save();
        res.status(201).json({
            message: 'Terminanfrage erfolgreich erstellt',
            appointment
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler bei der Terminerstellung', error });
    }
};
exports.createAppointment = createAppointment;
// Termine eines Patienten abrufen
const getPatientAppointments = async (req, res) => {
    try {
        const { patientName, patientGeburtsdatum } = req.query;
        const appointments = await Appointment_1.default.find({
            patientName,
            patientGeburtsdatum
        }).sort({ datum: 1, uhrzeit: 1 });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler beim Abrufen der Termine', error });
    }
};
exports.getPatientAppointments = getPatientAppointments;
// Termine eines Arztes abrufen
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await Appointment_1.default.find({
            arztId: doctorId
        }).sort({ datum: 1, uhrzeit: 1 });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler beim Abrufen der Termine', error });
    }
};
exports.getDoctorAppointments = getDoctorAppointments;
// Termin bestätigen
const confirmAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { doctor } = req;
        const appointment = await Appointment_1.default.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Termin nicht gefunden' });
        }
        if (appointment.arztId !== doctor.id) {
            return res.status(403).json({ message: 'Keine Berechtigung für diesen Termin' });
        }
        appointment.status = 'bestätigt';
        await appointment.save();
        res.json({
            message: 'Termin erfolgreich bestätigt',
            appointment
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler bei der Terminbestätigung', error });
    }
};
exports.confirmAppointment = confirmAppointment;
// Termin ablehnen
const rejectAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { doctor } = req;
        const appointment = await Appointment_1.default.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Termin nicht gefunden' });
        }
        if (appointment.arztId !== doctor.id) {
            return res.status(403).json({ message: 'Keine Berechtigung für diesen Termin' });
        }
        appointment.status = 'abgelehnt';
        await appointment.save();
        res.json({
            message: 'Termin erfolgreich abgelehnt',
            appointment
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server-Fehler bei der Terminablehnung', error });
    }
};
exports.rejectAppointment = rejectAppointment;
//# sourceMappingURL=appointmentController.js.map