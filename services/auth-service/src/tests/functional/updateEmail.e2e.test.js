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
const bcrypt_1 = require("bcrypt");
jest.mock("../../src/services/emailService", () => ({
    sendUserActivationEmail: jest.fn(),
}));
describe("Modification de l'email (e2e)", () => {
    it("devrait modifier l'email de l'utilisateur et désactiver le compte", () => __awaiter(void 0, void 0, void 0, function* () {
        const oldEmail = `user-${Date.now()}@example.com`;
        const newEmail = `updated-${Date.now()}@example.com`;
        const password = "Test1234!";
        const hashed = yield (0, bcrypt_1.hash)(password, 10);
        const user = yield User_1.default.create({
            email: oldEmail,
            password: hashed,
            acceptedTerms: true,
        });
        yield (0, supertest_1.default)(app_1.default).post("/fake-activate").send({ email: oldEmail });
        const resLogin = yield (0, supertest_1.default)(app_1.default).post("/login").send({
            email: oldEmail,
            password,
        });
        const cookies = resLogin.headers["set-cookie"];
        expect(cookies).toBeDefined();
        const resUpdate = yield (0, supertest_1.default)(app_1.default)
            .put("/update-email")
            .set("Cookie", cookies)
            .send({
            currentPassword: password,
            newEmail,
        });
        expect(resUpdate.status).toBe(200);
        expect(resUpdate.body.message).toMatch(/email.*mis à jour/i);
        const updatedUser = yield User_1.default.findByPk(user.id);
        expect(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email).toBe(newEmail);
        expect(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.isActive).toBe(false);
    }));
});
