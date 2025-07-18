import request from "supertest";
import app from "../../app";
import User from "../../models/User";
import PasswordResetToken from "../../models/PasswordResetToken";
import { hash, compare } from "bcrypt";

jest.mock("../../src/services/emailService", () => ({
    sendUserPasswordResetEmail: jest.fn(),
}));

describe("Parcours complet de réinitialisation du mot de passe", () => {
    it("devrait permettre de réinitialiser le mot de passe et se connecter", async () => {
        const email = `user-${Date.now()}@example.com`;
        const oldPassword = "OldPassword1!";
        const newPassword = "NewPassword1!";

        const hashed = await hash(oldPassword, 10);
        const user = await User.create({
            email,
            password: hashed,
            acceptedTerms: true,
        });

        const resActivate = await request(app)
            .post("/fake-activate")
            .send({ email });
        expect(resActivate.status).toBe(200);

        const freshUser = await User.findOne({ where: { email } });
        expect(freshUser?.isActive).toBe(true);

        const resForgot = await request(app)
            .post("/forgot-password")
            .send({ email });
        expect(resForgot.status).toBe(200);

        const tokenEntry = await PasswordResetToken.findOne({
            where: { userId: freshUser!.id },
        });

        expect(tokenEntry).not.toBeNull();

        const resReset = await request(app).post("/reset-password").send({
            token: tokenEntry!.token,
            newPassword,
        });

        expect(resReset.status).toBe(200);
        expect(resReset.body.message).toMatch(/réinitialisé/i);

        const updatedUser = await User.findOne({ where: { email } });
        const match = await compare(newPassword, updatedUser!.password);
        expect(match).toBe(true);

        const resLogin = await request(app).post("/login").send({
            email,
            password: newPassword,
        });

        expect(resLogin.status).toBe(200);
        expect(resLogin.body.data.token).toBeDefined();
    });
});
