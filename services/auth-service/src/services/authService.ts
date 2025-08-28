import bcrypt from "bcrypt";
import User from "../models/User";
import jwt, { SignOptions } from "jsonwebtoken";
import { RegisterData } from "../schemas/authSchema";
import axios from "axios";
import {
  sendUserActivationEmail,
  sendUserPasswordResetEmail,
} from "./emailService";
import PasswordResetToken from "../models/PasswordResetToken";
import logger from "../utils/logger";
import * as crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import config from "../config";
import {
  AppError,
  AuthError,
  ConflictError,
  NotFoundError,
} from "../errors/CustomErrors";

interface DecodedToken {
  id: number;
  iat?: number;
  exp?: number;
  pseudo: string;
  birthDate: string;
}

class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

type LoginResponse =
  | { token: string; id: string; userId: string }
  | { requires2FA: true; tempToken: string; userId: string }
  | { error: string };

import { Session } from "../models/Session";
import { hashRefresh, signAccess, ACCESS_TTL_SEC } from "../utils/tokens";

interface RefreshResult {
  accessToken: string;
}

export const refreshService = async (
  sid: string,
  refreshToken: string
): Promise<RefreshResult> => {
  const session = await Session.findByPk(sid);
  if (!session || session.revokedAt || new Date() > session.expiresAt) {
    throw new Error("Session invalide ou expirée");
  }

  const validHash = await hashRefresh(refreshToken);
  if (session.refreshHash !== validHash) {
    throw new Error("Refresh token invalide");
  }

  const newAccessToken = signAccess(
    { id: session.userId, userId: session.userId },
    ACCESS_TTL_SEC
  );

  return { accessToken: newAccessToken };
};

export function generateJWTForUser(user: User): string {
  const payload = {
    id: user.id,
    userId: (user as any).userId,
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: "1h",
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, options);
}

export const createUser = async (data: RegisterData) => {
  const { pseudo, birthDate, email, password, acceptedTerms, newsletter } =
    data;

  const birth = new Date(birthDate);
  if (birth > new Date()) {
    throw new ValidationError(
      "La date de naissance ne peut pas être dans le futur."
    );
  }

  if (!acceptedTerms) {
    throw new ValidationError(
      "Vous devez accepter les conditions générales d'utilisation."
    );
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictError("Cet email est déjà enregistré.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if ((data as any).role && (data as any).role !== "user") {
    throw new ValidationError(
      "Vous ne pouvez pas définir un rôle personnalisé."
    );
  }

  const user = await User.create({
    email,
    password: hashedPassword,
    acceptedTerms,
    newsletter,
    role: "user",
  });

  const jwtOptions: SignOptions = {
    expiresIn: "1h",
    audience: config.jwtAudience,
    issuer: config.jwtIssuer,
  };

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    jwtOptions
  );

  const activationToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      pseudo,
      birthDate: birth.toISOString(),
    },
    config.jwtSecret,
    {
      expiresIn: "24h",
    }
  );

  try {
    await sendUserActivationEmail(email, activationToken);
  } catch (error) {
    logger.error("Erreur envoi mail d'activation :", error);
    throw new Error("Impossible d'envoyer le mail d'activation.");
  }

  return user;
};

export const authenticateUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const user = await User.findOne({ where: { email } });

  if (!user) return { error: "Email ou mot de passe invalide." };

  if (!user.isActive)
    return { error: "Compte non activé. Merci de vérifier votre email." };

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { error: "Email ou mot de passe invalide." };

  let userProfileId: string | null = null;

  try {
    const response = await axios.get(
      `${config.apiUrls.USER_SERVICE}/api/internal/find-by-auth/${user.id}`,
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN,
        },
      }
    );

    userProfileId = response.data?.data?.profile?.id ?? null;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
  }

  if (user.twoFactorEnabled) {
    const tempToken = jwt.sign(
      {
        id: user.id,
        userId: userProfileId,
        email: user.email,
        twoFA: true,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: "5m" }
    );

    return {
      requires2FA: true,
      tempToken,
      id: user.id.toString(),
      userId: userProfileId || "",
    };
  }

  const token = jwt.sign(
    {
      id: user.id,
      userId: userProfileId,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: "1h",
      audience: config.jwtAudience,
      issuer: config.jwtIssuer,
    }
  );

  return { token, id: user.id.toString(), userId: userProfileId || "" };
};

export const setUserAsActive = async (token: string) => {
  let decoded: DecodedToken;

  try {
    decoded = jwt.verify(token, config.jwtSecret) as DecodedToken;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ValidationError("Le token d'activation a expiré.");
    }
    throw new ValidationError("Token d'activation invalide.");
  }

  const user = await User.findByPk(decoded.id);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");
  if (user.isActive) return "AlreadyActive";

  user.isActive = true;
  await user.save();

  try {
    await axios.post(
      `${config.apiUrls.USER_SERVICE}/api/internal/create-profile`,
      {
        userId: user.id,
        pseudo: decoded.pseudo,
        birthDate: decoded.birthDate,
      },
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN,
        },
      }
    );
  } catch (error) {
    const err = error as any;
    logger.error(
      "Erreur création du profil utilisateur :",
      err.response?.data || err.message || err
    );
    throw new Error("ProfileCreationFailed");
  }

  return "Success";
};

export const sendPasswordResetEmail = async (user: User) => {
  const token = crypto.randomBytes(32).toString("hex");

  await PasswordResetToken.upsert({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + config.tokenExpirationMs),
  });

  await sendUserPasswordResetEmail(user.email, token);
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const tokenEntry = await PasswordResetToken.findOne({ where: { token } });

  if (!tokenEntry)
    throw new ValidationError("Token de réinitialisation invalide.");

  if (tokenEntry.expiresAt < new Date()) {
    await PasswordResetToken.destroy({ where: { token } });
    throw new ValidationError("Token de réinitialisation expiré.");
  }

  const user = await User.findByPk(tokenEntry.userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  await PasswordResetToken.destroy({ where: { token } });
};

export const generate2FASecret = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

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

export const activate2FA = async (
  userId: number,
  code: string
): Promise<boolean> => {
  const user = await User.findByPk(userId);
  if (!user || !user.twoFactorSecret)
    throw new NotFoundError("Utilisateur ou secret 2FA introuvable.");

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (verified && !user.twoFactorEnabled) {
    user.twoFactorEnabled = true;
    await user.save();
  }

  return verified;
};

export const validate2FACode = async (userId: number, code: string) => {
  if (!code) throw new ValidationError("Code 2FA manquant.");

  const isValid = await activate2FA(userId, code);
  if (!isValid) throw new ValidationError("Code 2FA invalide.");

  const token = jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: "1h",
    audience: config.jwtAudience,
    issuer: config.jwtIssuer,
  });

  return token;
};

export const deactivate2FA = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  await user.save();
  return;
};

export const fetchUserAccount = async (userId: number) => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "email",
      "acceptedTerms",
      "newsletter",
      "twoFactorEnabled",
      "googleId",
    ],
  });

  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  return user;
};

export const changeUserEmail = async (
  userId: number,
  currentPassword: string,
  newEmail: string
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  if (user.email === newEmail) {
    throw new ValidationError("Le nouvel email est identique à l'actuel.");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) throw new ValidationError("Mot de passe incorrect.");

  const emailInUse = await User.findOne({ where: { email: newEmail } });
  if (emailInUse) throw new ConflictError("Email déjà utilisé.");

  user.email = newEmail;
  user.isActive = false;

  await user.save();

  const activationToken = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: "24h" }
  );

  await sendUserActivationEmail(newEmail, activationToken);
};

export const changeUserPassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) throw new AuthError("Mot de passe incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  await user.save();
};

export const changeNewsletterSubscription = async (
  userId: number,
  newsletter: boolean
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  user.newsletter = newsletter;

  await user.save();
};

export const removeUser = async (userId: number, password: string) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé.");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AuthError("Mot de passe incorrect");

  await user.destroy();
};

export const unlinkGoogle = async (user: User) => {
  const fullUser = await User.findByPk(user.id);

  if (!fullUser || !fullUser.password || fullUser.password.length < 20) {
    throw new AppError(
      "Vous devez d'abord définir un mot de passe avant de dissocier Google."
    );
  }

  fullUser.googleId = null;
  await fullUser.save();
};

export const createPasswordService = async (
  userId: string,
  password: string
) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError("Utilisateur introuvable");
  }

  if (user.password) {
    throw new ValidationError("Un mot de passe existe déjà pour ce compte.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;

  await user.save();
};

export async function deleteUserProfile(userId: string) {
  return await axios.delete(
    `${config.apiUrls.USER_SERVICE}/api/internal/delete-profile`,
    {
      headers: {
        "x-internal-token": process.env.INTERNAL_API_TOKEN!,
      },
      data: { userId },
    }
  );
}

export async function deleteUserWishlists(userId: string) {
  return await axios.delete(
    `${config.apiUrls.WISHLIST_SERVICE}/api/internal/wishlist/delete-wishlists`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
      },
      data: { userId },
    }
  );
}

export async function deleteUserExchanges(userId: string) {
  return await axios.delete(
    `${config.apiUrls.EXCHANGE_SERVICE}/api/internal/exchange/delete-exchanges`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
      },
      data: { userId },
    }
  );
}

export async function deleteUserNotifications(userId: string) {
  return await axios.delete(
    `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/notification/delete-notifications`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
      },
      data: { userId },
    }
  );
}

export async function fetchUserProfileId(
  authUserId: string
): Promise<string | null> {
  try {
    const response = await axios.get(
      `${config.apiUrls.USER_SERVICE}/api/internal/find-by-auth/${authUserId}`,
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN,
        },
      }
    );

    return response.data?.data?.profile?.id ?? null;
  } catch (error) {
    console.error("Erreur récupération profil utilisateur:", error);
    return null;
  }
}
