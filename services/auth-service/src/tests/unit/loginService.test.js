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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../src/models/User"));
const authService = __importStar(require("../../src/services/authService"));
jest.mock("../../src/models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
describe("authService.loginUser", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it("should return a token when credentials are correct and the account is active", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            isActive: true,
        };
        User_1.default.findOne.mockResolvedValue(mockUser);
        bcrypt_1.default.compare.mockResolvedValue(true);
        jsonwebtoken_1.default.sign.mockReturnValue("mockedToken");
        const result = yield authService.authenticateUser("test@example.com", "password123");
        expect(result).toEqual({ token: "mockedToken" });
        expect(User_1.default.findOne).toHaveBeenCalledWith({
            where: { email: "test@example.com" },
        });
        expect(bcrypt_1.default.compare).toHaveBeenCalledWith("password123", "hashedPassword");
        expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: 1, email: "test@example.com" }, expect.any(String), expect.objectContaining({ expiresIn: "1h" }));
    }));
    it("should return an error if the email does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findOne.mockResolvedValue(null);
        const result = yield authService.authenticateUser("notfound@example.com", "password");
        expect(result).toEqual({ error: "Email ou mot de passe invalide." });
    }));
    it("should return an error if the user exists but the account is not active", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            isActive: false,
        };
        User_1.default.findOne.mockResolvedValue(mockUser);
        const result = yield authService.authenticateUser("test@example.com", "password");
        expect(result).toEqual({
            error: "Compte non activé. Merci de vérifier votre email.",
        });
    }));
    it("should return an error if the password is incorrect", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = {
            id: 1,
            email: "test@example.com",
            password: "hashedPassword",
            isActive: true,
        };
        User_1.default.findOne.mockResolvedValue(mockUser);
        bcrypt_1.default.compare.mockResolvedValue(false);
        const result = yield authService.authenticateUser("test@example.com", "wrongpassword");
        expect(result).toEqual({ error: "Email ou mot de passe invalide." });
    }));
});
