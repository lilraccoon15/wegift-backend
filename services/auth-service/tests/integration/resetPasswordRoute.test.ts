import request from "supertest";
import app from "../../src/app";
import User from "../../src/models/User";
import PasswordResetToken from "../../src/models/PasswordResetToken";
import bcrypt from "bcrypt";

describe("POST /reset-password", () => {
  it("modifie le mot de passe si le token est valide", async () => {
    const user = await User.create({
      email: "reset@example.com",
      password: "Ancien123!",
      acceptedTerms: true,
      isActive: true,
    });

    const token = "token-valide-123";
    await PasswordResetToken.create({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 10000),
    });

    const res = await request(app).post("/reset-password").send({
      token,
      newPassword: "Nouveau123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/réinitialisé/i);

    const updatedUser = await User.findByPk(user.id);
    const isMatch = await bcrypt.compare("Nouveau123!", updatedUser!.password);
    expect(isMatch).toBe(true);
  });
});
