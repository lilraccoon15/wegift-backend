"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const User_1 = __importDefault(require("../../src/models/User"));
const PasswordResetToken_1 = __importDefault(require("../../src/models/PasswordResetToken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
describe("POST /reset-password", () => {
    it("modifie le mot de passe si le token est valide", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield User_1.default.create({
            email: "reset@example.com",
            password: "Ancien123!",
            acceptedTerms: true,
            isActive: true,
        });
        const token = "token-valide-123";
        yield PasswordResetToken_1.default.create({
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 10000),
        });
        const res = yield (0, supertest_1.default)(app_1.default).post("/reset-password").send({
            token,
            newPassword: "Nouveau123!",
        });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/réinitialisé/i);
        const updatedUser = yield User_1.default.findByPk(user.id);
        const isMatch = yield bcrypt_1.default.compare("Nouveau123!", updatedUser.password);
        expect(isMatch).toBe(true);
    }));
});
