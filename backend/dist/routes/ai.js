"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiController_1 = require("../controllers/aiController");
const router = express_1.default.Router();
// KI-gestützte Terminvorschläge
router.post('/suggest-appointments', aiController_1.suggestAppointments);
// Chatbot für Termin-Fragen
router.post('/chat', aiController_1.chatWithBot);
exports.default = router;
//# sourceMappingURL=ai.js.map