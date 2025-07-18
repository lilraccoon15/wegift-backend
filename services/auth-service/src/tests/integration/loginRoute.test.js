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
const database_1 = __importDefault(require("../../src/config/database"));
const User_1 = __importDefault(require("../../src/models/User"));
jest.setTimeout(15000);
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.authenticate();
    yield User_1.default.destroy({ where: { email: "utilisateur@test.com" } });
    try {
        const res = yield (0, supertest_1.default)(app_1.default).post("/register").send({
            pseudo: "Test",
            birthDate: "1990-01-01",
            email: "utilisateur@test.com",
            password: "MotDePasse123!",
            acceptedTerms: true,
            newsletter: false,
        });
    }
    catch (error) {
        console.error("Erreur pendant la création de l’utilisateur de test :", error);
        throw error;
    }
    const user = yield User_1.default.findOne({
        where: { email: "utilisateur@test.com" },
    });
    if (user) {
        user.isActive = true;
        yield user.save();
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.close();
}));
describe("POST /login", () => {
    it("devrait connecter un utilisateur avec des identifiants valides", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/login").send({
            email: "utilisateur@test.com",
            password: "MotDePasse123!",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("message", "Connexion réussie");
        const setCookie = response.headers["set-cookie"];
        expect(setCookie).toBeDefined();
        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
        const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
        expect(tokenCookie).toBeDefined();
        expect(tokenCookie).toMatch(/HttpOnly/);
    }));
    it("devrait échouer avec un email invalide", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/login").send({
            email: "mauvais.email",
            password: "MotDePasse123!",
        });
        expect([400, 401]).toContain(response.status);
        expect(response.body).toHaveProperty("message");
    }));
    it("devrait échouer avec un mauvais mot de passe", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).post("/login").send({
            email: "utilisateur@test.com",
            password: "mauvaisMotDePasse",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
    }));
});
