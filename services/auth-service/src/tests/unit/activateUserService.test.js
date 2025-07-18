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
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomErrors_1 = require("../../src/errors/CustomErrors");
const config_1 = __importDefault(require("../../src/config"));
jest.mock("../../src/models/User");
jest.mock("axios");
describe("setUserAsActive", () => {
    it("devrait activer un utilisateur inactif et appeler l'API de création de profil", () => __awaiter(void 0, void 0, void 0, function* () {
        const token = "validToken";
        const decodedToken = { id: 1, pseudo: "User1", birthDate: "1990-01-01" };
        jsonwebtoken_1.default.verify = jest.fn().mockReturnValue(decodedToken);
        User_1.default.findByPk = jest.fn().mockResolvedValue({
            id: 1,
            email: "user@example.com",
            isActive: false,
            save: jest.fn(),
        });
        axios_1.default.post = jest.fn().mockResolvedValue({});
        const result = yield (0, authService_1.setUserAsActive)(token);
        expect(result).toBe("Success");
        expect(User_1.default.findByPk).toHaveBeenCalledWith(1);
        expect(axios_1.default.post).toHaveBeenCalledWith(`${config_1.default.apiUrls.USER_SERVICE}/create-profile`, expect.objectContaining({
            userId: 1,
            pseudo: decodedToken.pseudo,
            birthDate: decodedToken.birthDate,
        }), expect.anything());
    }));
    it("devrait renvoyer AlreadyActive si l'utilisateur est déjà actif", () => __awaiter(void 0, void 0, void 0, function* () {
        const token = "validToken";
        const decodedToken = { id: 1, pseudo: "User1", birthDate: "1990-01-01" };
        jsonwebtoken_1.default.verify = jest.fn().mockReturnValue(decodedToken);
        User_1.default.findByPk = jest.fn().mockResolvedValue({
            id: 1,
            email: "user@example.com",
            isActive: true,
            save: jest.fn(),
        });
        const result = yield (0, authService_1.setUserAsActive)(token);
        expect(result).toBe("AlreadyActive");
    }));
    it("devrait échouer si l'utilisateur n'est pas trouvé", () => __awaiter(void 0, void 0, void 0, function* () {
        const token = "validToken";
        const decodedToken = { id: 1, pseudo: "User1", birthDate: "1990-01-01" };
        jsonwebtoken_1.default.verify = jest.fn().mockReturnValue(decodedToken);
        User_1.default.findByPk = jest.fn().mockResolvedValue(null);
        yield expect((0, authService_1.setUserAsActive)(token)).rejects.toThrowError(new CustomErrors_1.NotFoundError("Utilisateur non trouvé."));
    }));
});
