import request from "supertest";
import app from "../../app";
import sequelize from "../../config/database";
import User from "../../models/User";

jest.setTimeout(15000);

beforeAll(async () => {
    await sequelize.authenticate();

    await User.destroy({ where: { email: "utilisateur@test.com" } });

    try {
        const res = await request(app).post("/register").send({
            pseudo: "Test",
            birthDate: "1990-01-01",
            email: "utilisateur@test.com",
            password: "MotDePasse123!",
            acceptedTerms: true,
            newsletter: false,
        });

        console.log("Inscription test :", res.status, res.body);
    } catch (error) {
        console.error(
            "Erreur pendant la création de l’utilisateur de test :",
            error
        );
        throw error;
    }

    const user = await User.findOne({
        where: { email: "utilisateur@test.com" },
    });
    if (user) {
        user.isActive = true;
        await user.save();
    }
});

afterAll(async () => {
    await sequelize.close();
});

describe("POST /login", () => {
    it("devrait connecter un utilisateur avec des identifiants valides", async () => {
        const response = await request(app).post("/login").send({
            email: "utilisateur@test.com",
            password: "MotDePasse123!",
        });

        console.log("Résultat login :", response.status, response.body);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("message", "Connexion réussie");

        const setCookie = response.headers["set-cookie"];

        expect(setCookie).toBeDefined();

        const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

        const tokenCookie = cookies.find((cookie: string) =>
            cookie.startsWith("token=")
        );

        expect(tokenCookie).toBeDefined();
        expect(tokenCookie).toMatch(/HttpOnly/);
    });

    it("devrait échouer avec un email invalide", async () => {
        const response = await request(app).post("/login").send({
            email: "mauvais.email",
            password: "MotDePasse123!",
        });

        console.log("Email invalide :", response.status, response.body);

        expect([400, 401]).toContain(response.status);
        expect(response.body).toHaveProperty("error");
    });

    it("devrait échouer avec un mauvais mot de passe", async () => {
        const response = await request(app).post("/login").send({
            email: "utilisateur@test.com",
            password: "mauvaisMotDePasse",
        });

        console.log("Mauvais mot de passe :", response.status, response.body);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
    });
});
