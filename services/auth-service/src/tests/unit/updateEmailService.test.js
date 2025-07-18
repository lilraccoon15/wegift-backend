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
const authService_1 = require("../../src/services/authService");
const User_1 = __importDefault(require("../../src/models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../../src/services/emailService");
jest.mock("../../src/models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../src/services/emailService");
describe("changeUserEmail", () => {
    const userId = 1;
    const currentPassword = "MotDePasse123!";
    const newEmail = "nouvel@example.com";
    const mockUser = {
        id: userId,
        email: "ancien@example.com",
        password: "hashedPassword",
        isActive: true,
        save: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("devrait changer l'email et envoyer un mail d'activation", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findByPk.mockResolvedValue(mockUser);
        bcrypt_1.default.compare.mockResolvedValue(true);
        User_1.default.findOne.mockResolvedValue(null);
        jsonwebtoken_1.default.sign.mockReturnValue("faketoken");
        yield (0, authService_1.changeUserEmail)(userId, currentPassword, newEmail);
        expect(mockUser.email).toBe(newEmail);
        expect(mockUser.isActive).toBe(false);
        expect(mockUser.save).toHaveBeenCalled();
        expect(emailService_1.sendUserActivationEmail).toHaveBeenCalledWith(newEmail, "faketoken");
    }));
    it("devrait échouer si l'utilisateur n'existe pas", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findByPk.mockResolvedValue(null);
        yield expect((0, authService_1.changeUserEmail)(userId, currentPassword, newEmail)).rejects.toThrow("Utilisateur non trouvé.");
    }));
    it("devrait échouer si l'email est identique", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findByPk.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { email: newEmail }));
        yield expect((0, authService_1.changeUserEmail)(userId, currentPassword, newEmail)).rejects.toThrow("Le nouvel email est identique à l'actuel.");
    }));
    it("devrait échouer si le mot de passe est incorrect", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findByPk.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { email: "autre@example.com" }));
        bcrypt_1.default.compare.mockResolvedValue(false);
        yield expect((0, authService_1.changeUserEmail)(userId, currentPassword, newEmail)).rejects.toThrow("Mot de passe incorrect.");
    }));
    it("devrait échouer si le nouvel email est déjà utilisé", () => __awaiter(void 0, void 0, void 0, function* () {
        User_1.default.findByPk.mockResolvedValue(Object.assign(Object.assign({}, mockUser), { email: "autre@example.com" }));
        bcrypt_1.default.compare.mockResolvedValue(true);
        User_1.default.findOne.mockResolvedValue({ id: 2 });
        yield expect((0, authService_1.changeUserEmail)(userId, currentPassword, newEmail)).rejects.toThrow("Email déjà utilisé.");
    }));
});
