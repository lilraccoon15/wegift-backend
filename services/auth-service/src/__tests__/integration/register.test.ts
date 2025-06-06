import request from "supertest";
import app from "../../app";

describe("POST /register", () => {
    it("should register a new user successfully", async () => {
        const newUser = {
            firstName: "Test",
            lastName: "User",
            birthDate: "1990-01-01",
            email: `testuser${Date.now()}@example.com`,
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        };

        const response = await request(app).post("/register").send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty(
            "message",
            "Utilisateur créé avec succès"
        );
        expect(response.body.data).toHaveProperty("userId");
    }, 15000);

    it("should fail if email format is invalid", async () => {
        const newUser = {
            firstName: "Test",
            lastName: "User",
            birthDate: "1990-01-01",
            email: "notanemail",
            password: "Aa1!aaaa",
            acceptedTerms: true,
            newsletter: false,
        };

        const response = await request(app).post("/register").send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Email invalide.");
    });

    it("should fail if password does not meet criteria", async () => {
        const newUser = {
            firstName: "Test",
            lastName: "User",
            birthDate: "1990-01-01",
            email: `testuser${Date.now()}@example.com`,
            password: "password",
            acceptedTerms: true,
            newsletter: false,
        };

        const response = await request(app).post("/register").send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
        expect(response.body.error.toLowerCase()).toMatch(/mot de passe/);
    });

    it("should fail if acceptedTerms is false", async () => {
        const newUser = {
            firstName: "Test",
            lastName: "User",
            birthDate: "1990-01-01",
            email: `testuser${Date.now()}@example.com`,
            password: "Aa1!aaaa",
            acceptedTerms: false,
            newsletter: false,
        };

        const response = await request(app).post("/register").send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty(
            "message",
            "Vous devez accepter les conditions générales d'utilisation."
        );
        expect(response.body).toHaveProperty("success", false);
    });
});
