"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcrypt_1 = __importDefault(require("bcrypt"));
const service = __importStar(require("../../src/services/authService"));
const User_1 = __importDefault(require("../../src/models/User"));
const PasswordResetToken_1 = __importDefault(require("../../src/models/PasswordResetToken"));
jest.mock("../../src/models/User", () => ({
    findByPk: jest.fn(),
}));
jest.mock("../../src/models/PasswordResetToken", () => ({
    findOne: jest.fn(),
    destroy: jest.fn(),
}));
jest.mock("bcrypt", () => ({
    hash: jest.fn(() => "hashed-pw"),
}));
describe("resetUserPassword", () => {
    const fakeToken = "reset-token";
    const newPassword = "NewPassw0rd!";
    it("réinitialise le mot de passe et supprime le token", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = { id: 1, password: "old", save: jest.fn() };
        PasswordResetToken_1.default.findOne.mockResolvedValue({
            token: fakeToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 10000),
        });
        User_1.default.findByPk.mockResolvedValue(user);
        yield service.resetUserPassword(fakeToken, newPassword);
        expect(bcrypt_1.default.hash).toHaveBeenCalledWith(newPassword, 10);
        expect(user.save).toHaveBeenCalled();
        expect(user.password).toBe("hashed-pw");
        expect(PasswordResetToken_1.default.destroy).toHaveBeenCalledWith({
            where: { token: fakeToken },
        });
    }));
});
