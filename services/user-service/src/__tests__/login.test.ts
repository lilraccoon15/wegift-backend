import request from 'supertest';
import app from '../app';
import sequelize from '../config/database';
import User from '../models/User';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  await sequelize.authenticate();

  // Supprimer uniquement l'utilisateur de test s'il existe déjà
  await User.destroy({ where: { email: 'utilisateur@test.com' } });

  const hashedPassword = await bcrypt.hash('MotDePasse123!', 10);

  await User.create({
    email: 'utilisateur@test.com',
    password: hashedPassword,
    firstName: 'Camille',           // 🟢 correction ici
    lastName: 'Test',               // 🟢 correction ici
    birthDate: new Date('1990-01-01'), // 🟢 correction ici
    acceptedTerms: true,
  });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /login', () => {
  it('devrait connecter un utilisateur avec des identifiants valides', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'utilisateur@test.com',
        password: 'MotDePasse123!',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  it('devrait échouer avec un email invalide', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'mauvais.email',
        password: 'MotDePasse123!',
      });

    expect([400, 401]).toContain(response.status);
    expect(response.body).toHaveProperty('message');
  });

  it('devrait échouer avec un mauvais mot de passe', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'utilisateur@test.com',
        password: 'mauvaisMotDePasse',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });
});
