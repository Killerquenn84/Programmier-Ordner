"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const appointmentController_1 = require("../controllers/appointmentController");
const router = express_1.default.Router();
// Termin erstellen (öffentlich, für Patienten)
router.post('/', appointmentController_1.createAppointment);
// Termine eines Patienten abrufen (öffentlich)
router.get('/', appointmentController_1.getPatientAppointments);
// Termine eines Arztes abrufen (geschützt)
router.get('/doctor/:doctorId', auth_1.auth, appointmentController_1.getDoctorAppointments);
// Termin bestätigen (geschützt, nur für Ärzte)
router.post('/:appointmentId/confirm', auth_1.auth, appointmentController_1.confirmAppointment);
// Termin ablehnen (geschützt, nur für Ärzte)
router.post('/:appointmentId/reject', auth_1.auth, appointmentController_1.rejectAppointment);
exports.default = router;
//# sourceMappingURL=appointments.js.map