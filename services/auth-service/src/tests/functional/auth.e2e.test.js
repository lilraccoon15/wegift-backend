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
process.env.NODE_ENV = "test-local";
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
describe("Parcours complet utilisateur (e2e)", () => {
    it("devrait inscrire, activer puis connecter un utilisateur", () => __awaiter(void 0, void 0, void 0, function* () {
        const email = `test-e2e-${Date.now()}@example.com`;
        const password = "Aa1!aaaa";
        const resRegister = yield (0, supertest_1.default)(app_1.default).post("/register").send({
            pseudo: "UserE2E",
            birthDate: "1990-01-01",
            email,
            password,
            acceptedTerms: true,
            newsletter: false,
        });
        expect(resRegister.status).toBe(201);
        const userId = resRegister.body.data.userId;
        expect(userId).toBeDefined();
        const resActivate = yield (0, supertest_1.default)(app_1.default)
            .post("/fake-activate")
            .send({ email });
        expect(resActivate.status).toBe(200);
        const resLogin = yield (0, supertest_1.default)(app_1.default)
            .post("/login")
            .send({ email, password });
        expect(resLogin.status).toBe(200);
        const cookies = resLogin.headers["set-cookie"];
        expect(cookies).toBeDefined();
    }));
});
