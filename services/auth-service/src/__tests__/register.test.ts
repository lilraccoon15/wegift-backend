import request from 'supertest';
import app from '../../src/app'; 

describe('POST /register', () => {
  it('should register a new user successfully', async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      birthDate: "1990-01-01",
      email: `testuser${Date.now()}@example.com`, 
      password: "Aa1!aaaa",
      acceptedTerms: true,
      newsletter: false,
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);
      
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Utilisateur créé avec succès");
    expect(response.body.userId).toBeDefined();
  });

  it('should fail if email format is invalid', async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      birthDate: "1990-01-01",
      email: "notanemail",
      password: "Aa1!aaaa",
      acceptedTerms: true,
      newsletter: false,
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Format d'email invalide.");
  });

  it('should fail if password does not meet criteria', async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      birthDate: "1990-01-01",
      email: `testuser${Date.now()}@example.com`,
      password: "password",
      acceptedTerms: true,
      newsletter: false,
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/mot de passe/);
  });

  it('should fail if acceptedTerms is false', async () => {
    const newUser = {
      firstName: "Test",
      lastName: "User",
      birthDate: "1990-01-01",
      email: `testuser${Date.now()}@example.com`,
      password: "Aa1!aaaa",
      acceptedTerms: false,
      newsletter: false,
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Les conditions générales doivent être acceptées.");
  });
});
