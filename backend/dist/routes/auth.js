"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Arzt registrieren
router.post('/register', authController_1.registerDoctor);
// Arzt einloggen
router.post('/login', authController_1.loginDoctor);
exports.default = router;
//# sourceMappingURL=auth.js.map