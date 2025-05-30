import bcrypt from "bcrypt";
import User from "../models/User";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { RegisterData } from "../schemas/authSchema";
import axios from "axios";
import { sendActivationEmail, sendResetPasswordEmail } from "./emailService";
import PasswordResetToken from "../models/PasswordResetToken";
import logger from '../utils/logger';
import * as crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

type LoginResponse =
  | { token: string }
  | { requires2FA: true; tempToken: string }
  | { error: string };

const SECRET: Secret = process.env.JWT_SECRET || "default_secret";

const AUDIENCE = process.env.JWT_AUDIENCE || "your-app";
const ISSUER = process.env.JWT_ISSUER || "your-api";
const TOKEN_EXPIRATION = 60 * 60 * 1000;

export const registerUser = async (data: RegisterData) => {
  const {
    firstName,
    lastName,
    birthDate,
    email,
    password,
    acceptedTerms,
    newsletter,
  } = data;

  const birth = new Date(birthDate);
  if (birth > new Date()) {
    throw new ValidationError(
      "La date de naissance ne peut pas être dans le futur."
    );
  }

  if (!acceptedTerms) {
    throw new Error(
      "Vous devez accepter les conditions générales d'utilisation."
    );
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

  const jwtOptions: SignOptions = {
    expiresIn: "1h",
    audience: AUDIENCE,
    issuer: ISSUER,
  };

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, jwtOptions);

  const activationToken = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "24h",
  });

  try {
    await sendActivationEmail(email, activationToken);
  } catch (error) {
    logger.error("Erreur envoi mail d'activation :", error);
    throw new Error("Impossible d'envoyer le mail d'activation.");
  }

  try {
    await axios.post(
      "http://localhost:3003/profile",
      {
        userId: user.id,
        firstName,
        lastName,
        birthDate: birth,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    const err = error as any;
    logger.error(
      "Erreur création profil :",
      err.response?.data || err.message || err
    );
    await User.destroy({ where: { id: user.id } });
    throw new Error("Erreur lors de la création du profil utilisateur.");
  }

  return user;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const user = await User.findOne({ where: { email } });

  if (!user) return { error: "Email ou mot de passe invalide." };

  if (!user.isActive)
    return { error: "Compte non activé. Merci de vérifier votre email." };

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Email ou mot de passe invalide." };

  if (user.twoFactorEnabled) {
    const tempToken = jwt.sign(
      { id: user.id, email: user.email, twoFA: true },
      SECRET,
      { expiresIn: "5m" }
    );

    return { requires2FA: true, tempToken };
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1h",
    audience: AUDIENCE,
    issuer: ISSUER,
  });

  return { token };
};

export const sendPasswordResetEmail = async (user: any) => {
  const token = crypto.randomBytes(32).toString("hex");

  await PasswordResetToken.upsert({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRATION),
  });

  await sendResetPasswordEmail(user.email, token);
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const tokenEntry = await PasswordResetToken.findOne({ where: { token } });

  if (!tokenEntry) throw new Error("Token invalide.");

  if (tokenEntry.expiresAt < new Date()) {
    await PasswordResetToken.destroy({ where: { token } });
    throw new Error("Token expiré.");
  }

  const user = await User.findByPk(tokenEntry.userId);
  if (!user) throw new Error("Utilisateur non trouvé.");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  await PasswordResetToken.destroy({ where: { token } });
};

export const setupTwoFactor = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Utilisateur non trouvé');

  const secret = speakeasy.generateSecret({
    name: `WeGift (${user.email})`,
  });

  user.twoFactorSecret = secret.base32;
  await user.save();

  if (!secret.otpauth_url) {
    throw new Error("L'URL otpauth est manquante");
  }

  const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

  return {
    qrCodeDataURL,
    otpauthUrl: secret.otpauth_url,
    secret: secret.base32,
  };
};