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
jest.mock("../../src/services/emailService", () => ({
    __esModule: true,
    sendUserPasswordResetEmail: jest.fn(),
}));
describe("POST /forgot-password", () => {
    it("retourne toujours 200 même si l’email n’existe pas", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/forgot-password")
            .send({ email: "notfound@example.com" });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/un lien a été envoyé/i);
    }));
    it("crée un token si l’email existe", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield User_1.default.create({
            email: "exist@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: true,
        });
        const res = yield (0, supertest_1.default)(app_1.default)
            .post("/forgot-password")
            .send({ email: "exist@example.com" });
        expect(res.status).toBe(200);
        const token = yield PasswordResetToken_1.default.findOne({
            where: { userId: user.id },
        });
        expect(token).not.toBeNull();
    }));
});
