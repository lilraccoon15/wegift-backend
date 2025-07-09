import request from "supertest";
import app from "../../src/app";
import User from "../../src/models/User";
import { hash } from "bcrypt";

jest.mock("../../src/services/emailService", () => ({
  sendUserActivationEmail: jest.fn(),
}));

describe("Modification de l'email (e2e)", () => {
  it("devrait modifier l'email de l'utilisateur et désactiver le compte", async () => {
    const oldEmail = `user-${Date.now()}@example.com`;
    const newEmail = `updated-${Date.now()}@example.com`;
    const password = "Test1234!";

    const hashed = await hash(password, 10);
    const user = await User.create({
      email: oldEmail,
      password: hashed,
      acceptedTerms: true,
    });

    await request(app).post("/fake-activate").send({ email: oldEmail });

    const resLogin = await request(app).post("/login").send({
      email: oldEmail,
      password,
    });

    const cookies = resLogin.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const resUpdate = await request(app)
      .put("/update-email")
      .set("Cookie", cookies)
      .send({
        currentPassword: password,
        newEmail,
      });

    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.message).toMatch(/email.*mis à jour/i);

    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser?.email).toBe(newEmail);
    expect(updatedUser?.isActive).toBe(false);
  });
});
