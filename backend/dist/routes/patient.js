"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patientController_1 = require("../controllers/patientController");
const router = express_1.default.Router();
// Patienten identifizieren oder erstellen
router.post('/identify', patientController_1.identifyPatient);
// Patienten-Daten abrufen
router.get('/data', patientController_1.getPatientData);
exports.default = router;
//# sourceMappingURL=patient.js.map