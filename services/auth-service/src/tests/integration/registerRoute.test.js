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
describe("POST /register", () => {
    it("should register a new user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            pseudo: "User",
            birthDate: "1990-01-01",
            email: `testuser${Date.now()}@example.com`,
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/register").send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Utilisateur créé avec succès");
        expect(response.body.data).toHaveProperty("userId");
    }), 15000);
    it("should fail if email format is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            pseudo: "User",
            birthDate: "1990-01-01",
            email: "notanemail",
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/register").send(newUser);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Email invalide.");
    }));
    it("should fail if password does not meet criteria", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            pseudo: "User",
            birthDate: "1990-01-01",
            email: `testuser${Date.now()}@example.com`,
            password: "password",
            acceptedTerms: true,
            newsletter: false,
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/register").send(newUser);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message.toLowerCase()).toMatch(/mot de passe/);
    }));
    it("should fail if acceptedTerms is false", () => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = {
            pseudo: "User",
            birthDate: "1990-01-01",
            email: `testuser${Date.now()}@example.com`,
            password: "Aa1!aaaa",
            acceptedTerms: false,
            newsletter: false,
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/register").send(newUser);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Vous devez accepter les conditions générales d'utilisation.");
    }));
});
