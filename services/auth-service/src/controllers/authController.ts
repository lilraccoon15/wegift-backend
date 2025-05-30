import { NextFunction, Request, Response } from "express";
import { registerUser, loginUser, sendPasswordResetEmail, resetUserPassword, setupTwoFactor } from "../services/authService";
import jwt from "jsonwebtoken";
import User from "../models/User";
import logger from '../utils/logger';
import sendSuccess from "../utils/sendSuccess";
import sendError from "../utils/sendError";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

interface DecodedToken {
  id: number;
  iat?: number;
  exp?: number;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await registerUser(req.body);
    sendSuccess(res, "Utilisateur créé avec succès", { userId: user.id }, 201);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    if ("error" in result) {
      return sendError(res, result.error, 401);
    }

    if ("requires2FA" in result) {
      return sendSuccess(res, "Double authentification requise", {
        requires2FA: true,
        tempToken: result.tempToken,
      });
    }

    res.cookie("token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });

    sendSuccess(res, "Connexion réussie");
    } catch (error) {
      next(error);
    }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendSuccess(res, "Déconnexion réussie");
};

export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query;

  if (!token) {
    return sendError(res, "Token manquant", 400);
  }

  try {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as DecodedToken;
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return sendError(res, "Utilisateur non trouvé", 404);
    }

    if (user.isActive) {
      return sendError(res, "Compte déjà activé", 400);
    }

    user.isActive = true;
    await user.save();

    sendSuccess(res, "Compte activé avec succès !");
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, "Token expiré", 400);
    }
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      await sendPasswordResetEmail(user);
    }

    sendSuccess(res, "Si cet email existe, un lien a été envoyé.");
  } catch (error) {
    next(error);
  }
};

export const confirmPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  const { token, newPassword } = req.body;

  try {
    await resetUserPassword(token, newPassword);
    sendSuccess(res, "Mot de passe réinitialisé avec succès.");
  } catch (error: any) {
    next(error);
  }
};

export const setup2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, "Non autorisé", 401);
    }

    const { qrCodeDataURL, otpauthUrl, secret } = await setupTwoFactor(userId);
    return sendSuccess(res, "2FA configurée avec succès", { qrCodeDataURL, otpauthUrl, secret });
  } catch (err) {
    return sendError(res, "Erreur lors de la configuration 2FA", 500);
  }
};

