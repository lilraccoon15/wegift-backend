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
const bcrypt_1 = require("bcrypt");
jest.mock("../../src/services/emailService", () => ({
    sendUserPasswordResetEmail: jest.fn(),
}));
describe("Parcours complet de réinitialisation du mot de passe", () => {
    it("devrait permettre de réinitialiser le mot de passe et se connecter", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = `user-${Date.now()}@example.com`;
        const oldPassword = "OldPassword1!";
        const newPassword = "NewPassword1!";
        const hashed = yield (0, bcrypt_1.hash)(oldPassword, 10);
        const user = yield User_1.default.create({
            email,
            password: hashed,
            acceptedTerms: true,
        });
        const resActivate = yield (0, supertest_1.default)(app_1.default)
            .post("/fake-activate")
            .send({ email });
        expect(resActivate.status).toBe(200);
        const freshUser = yield User_1.default.findOne({ where: { email } });
        expect(freshUser === null || freshUser === void 0 ? void 0 : freshUser.isActive).toBe(true);
        const resForgot = yield (0, supertest_1.default)(app_1.default)
            .post("/forgot-password")
            .send({ email });
        expect(resForgot.status).toBe(200);
        const tokenEntry = yield PasswordResetToken_1.default.findOne({
            where: { userId: freshUser.id },
        });
        expect(tokenEntry).not.toBeNull();
        const resReset = yield (0, supertest_1.default)(app_1.default).post("/reset-password").send({
            token: tokenEntry.token,
            newPassword,
        });
        expect(resReset.status).toBe(200);
        expect(resReset.body.message).toMatch(/réinitialisé/i);
        const updatedUser = yield User_1.default.findOne({ where: { email } });
        const match = yield (0, bcrypt_1.compare)(newPassword, updatedUser.password);
        expect(match).toBe(true);
        const resLogin = yield (0, supertest_1.default)(app_1.default).post("/login").send({
            email,
            password: newPassword,
        });
        expect(resLogin.status).toBe(200);
        expect(resLogin.body.data.token).toBeDefined();
    }));
});
