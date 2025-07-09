process.env.NODE_ENV = "test-local";

import request from "supertest";

import app from "../../src/app";

describe("Parcours complet utilisateur (e2e)", () => {
  it("devrait inscrire, activer puis connecter un utilisateur", async () => {
    const email = `test-e2e-${Date.now()}@example.com`;
    const password = "Aa1!aaaa";

    const resRegister = await request(app).post("/register").send({
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

    const resActivate = await request(app)
      .post("/fake-activate")
      .send({ email });

    expect(resActivate.status).toBe(200);

    const resLogin = await request(app)
      .post("/login")
      .send({ email, password });

    expect(resLogin.status).toBe(200);

    const cookies = resLogin.headers["set-cookie"];
    expect(cookies).toBeDefined();
  });
});
