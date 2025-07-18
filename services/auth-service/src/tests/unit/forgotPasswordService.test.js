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
jest.mock("../../src/services/emailService", () => ({
    __esModule: true,
    sendUserPasswordResetEmail: jest.fn(),
}));
jest.mock("../../src/models/PasswordResetToken", () => ({
    __esModule: true,
    default: {
        upsert: jest.fn(),
    },
}));
const { sendPasswordResetEmail } = require("../../src/services/authService");
const emailService = require("../../src/services/emailService");
const PasswordResetToken = require("../../src/models/PasswordResetToken").default;
describe("sendPasswordResetEmail", () => {
    it("devrait générer et stocker un token de réinitialisation", () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeUser = {
            id: "user-id-123",
            email: "test@example.com",
        };
        yield sendPasswordResetEmail(fakeUser);
        expect(PasswordResetToken.upsert).toHaveBeenCalledTimes(1);
        const [data] = PasswordResetToken.upsert.mock.calls[0];
        expect(data.userId).toBe(fakeUser.id);
        expect(typeof data.token).toBe("string");
        expect(data.expiresAt instanceof Date).toBe(true);
        expect(emailService.sendUserPasswordResetEmail).toHaveBeenCalledWith(fakeUser.email, data.token);
    }));
});
