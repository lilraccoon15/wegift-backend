import bcrypt from 'bcrypt';
import User from '../models/User';
import jwt from "jsonwebtoken";
import { RegisterData } from '../schemas/authSchema';
import axios from 'axios';

class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

const SECRET = process.env.JWT_SECRET || "default_secret";
const AUDIENCE = process.env.JWT_AUDIENCE || "your-app";
const ISSUER = process.env.JWT_ISSUER || "your-api";



export const registerUser = async (data: RegisterData) => {
  const { firstName, lastName, birthDate, email, password, acceptedTerms, newsletter } = data;

  const birth = new Date(birthDate);
  if (birth > new Date()) {
    throw new ValidationError("La date de naissance ne peut pas être dans le futur.");
  }

  if (!acceptedTerms) {
    throw new Error("Vous devez accepter les conditions générales d'utilisation.");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Cet email est déjà enregistré.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);  

  const user = await User.create({
    email,
    password: hashedPassword,
    acceptedTerms,
    newsletter,
  });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    {
      expiresIn: "1h",
      audience: AUDIENCE,
      issuer: ISSUER,
    }
  );

  try {
    await axios.post('http://localhost:3003/api/users/profile', 
      {
      userId: user.id,
      firstName,
      lastName,
      birthDate: birth,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
  );
  } catch (error) {
    const err = error as any;
    console.error("Erreur création profil :", err.response?.data || err.message || err);    await User.destroy({ where: { id: user.id } });
    throw new Error("Erreur lors de la création du profil utilisateur.");
  }

  return user;
};

export const loginUser = async (email: string, password: string): Promise<{ token?: string; error?: string }> => {
  const user = await User.findOne({ where: { email } });

  if (!user) return { error: "Email ou mot de passe invalide." };

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Email ou mot de passe invalide." };

  const token = jwt.sign(
    { id: user.id, email: user.email },
    SECRET,
    {
      expiresIn: "1h",
      audience: AUDIENCE,
      issuer: ISSUER,
    }
  );

  return { token };
};