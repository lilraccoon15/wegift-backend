import request from "supertest";
import app from "../../app";
import User from "../../models/User";
import PasswordResetToken from "../../models/PasswordResetToken";

jest.mock("../../src/services/emailService", () => ({
    __esModule: true,
    sendUserPasswordResetEmail: jest.fn(),
}));

describe("POST /forgot-password", () => {
    it("retourne toujours 200 même si l’email n’existe pas", async () => {
        const res = await request(app)
            .post("/forgot-password")
            .send({ email: "notfound@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/un lien a été envoyé/i);
    });

    it("crée un token si l’email existe", async () => {
        const user = await User.create({
            email: "exist@example.com",
            password: "Aa1!aaaa",
            acceptedTerms: true,
        });

        const res = await request(app)
            .post("/forgot-password")
            .send({ email: "exist@example.com" });

        expect(res.status).toBe(200);

        const token = await PasswordResetToken.findOne({
            where: { userId: user.id },
        });

        expect(token).not.toBeNull();
    });
});
