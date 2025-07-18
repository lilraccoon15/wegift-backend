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
const authService = __importStar(require("../../src/services/authService"));
const User_1 = __importDefault(require("../../src/models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService = __importStar(require("../../src/services/emailService"));
const axios_1 = __importDefault(require("axios"));
jest.mock("../../src/models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../src/services/emailService");
jest.mock("axios");
const mockedAxios = axios_1.default;
describe("authService.registerUser", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it("should throw error if birthDate is in the future", () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(authService.createUser({
            pseudo: "Test",
            birthDate: "2999-01-01",
            email: "test@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        })).rejects.toThrow("La date de naissance ne peut pas être dans le futur.");
    }));
    it("should throw error if acceptedTerms is false", () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect(authService.createUser({
            pseudo: "User",
            birthDate: "1990-01-01",
            email: "test@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: false,
            newsletter: false,
        })).rejects.toThrow("Vous devez accepter les conditions générales d'utilisation.");
    }));
    it("should throw error if user already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findOne.mockResolvedValue({ id: 1 });
        yield expect(authService.createUser({
            pseudo: "User",
            birthDate: "1990-01-01",
            email: "test@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        })).rejects.toThrow("Cet email est déjà enregistré.");
    }));
    it("should create user and send activation email", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findOne.mockResolvedValue(null);
        bcrypt_1.default.hash.mockResolvedValue("hashedpassword");
        User_1.default.create.mockResolvedValue({
            id: 123,
            email: "test@example.com",
        });
        jsonwebtoken_1.default.sign.mockReturnValue("token");
        emailService.sendUserActivationEmail.mockResolvedValue(undefined);
        mockedAxios.post.mockResolvedValue({ status: 200 });
        const user = yield authService.createUser({
            pseudo: "User",
            birthDate: "1990-01-01",
            email: "test@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        });
        expect(user).toHaveProperty("id", 123);
        expect(emailService.sendUserActivationEmail).toHaveBeenCalled();
    }));
});
