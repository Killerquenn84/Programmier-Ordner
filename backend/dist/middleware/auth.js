"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
// JWT Secret aus Umgebungsvariablen
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Middleware zur Überprüfung des JWT-Tokens
const auth = async (req, res, next) => {
    try {
        // Token aus dem Authorization-Header extrahieren
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Keine Authentifizierung' });
        }
        // Token verifizieren
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Arzt aus der Datenbank holen
        const doctor = await Doctor_1.default.findById(decoded.id);
        if (!doctor) {
            return res.status(401).json({ message: 'Arzt nicht gefunden' });
        }
        // Arzt zum Request hinzufügen
        req.doctor = doctor;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Bitte authentifizieren' });
    }
};
exports.auth = auth;
// Funktion zum Generieren eines JWT-Tokens
const generateToken = (doctorId) => {
    return jsonwebtoken_1.default.sign({ id: doctorId }, JWT_SECRET, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map