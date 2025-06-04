import { NextFunction, Request, Response } from "express";
import {
    registerUser,
    loginUser,
    sendPasswordResetEmail,
    resetUserPassword,
    setupTwoFactor,
    verifyTwoFactorCode,
} from "../services/authService";
import jwt from "jsonwebtoken";
import User from "../models/User";
import sendSuccess from "../utils/sendSuccess";
import sendError from "../utils/sendError";
import { AuthenticatedRequest } from "../../../../shared/middlewares/verifyTokenMiddleware";
import { SECRET, AUDIENCE, ISSUER } from "../services/authService";
import { sendActivationEmail } from "../services/emailService";
import bcrypt from "bcrypt";

interface DecodedToken {
    id: number;
    iat?: number;
    exp?: number;
}

export const checkAuth = (req: AuthenticatedRequest, res: Response) => {
    console.log("REQ HEADERS:", req.headers.cookie);
console.log("REQ COOKIES:", req.cookies);
    if (!req.user?.id) {
        return sendError(res, "Non authentifié", 401);
    }

    return sendSuccess(res, "Utilisateur authentifié", {
        userId: req.user.id,
    }, 200);
};


export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await registerUser(req.body);
        sendSuccess(
            res,
            "Utilisateur créé avec succès",
            { userId: user.id },
            201
        );
    } catch (error: any) {
        if (error.statusCode) {
            return sendError(res, error.message, error.statusCode);
        }
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("NODE_ENV =", process.env.NODE_ENV);
    try {
        const { email, password } = req.body;

        const result = await loginUser(email, password);

        if ("error" in result) return sendError(res, result.error, 401);

        if ("requires2FA" in result) {
            return sendSuccess(
                res,
                "Double authentification requise",
                {
                    requires2FA: true,
                    tempToken: result.tempToken,
                },
                200
            );
        }

        res.cookie("token", result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3600000,
        });

        sendSuccess(res, "Connexion réussie", {}, 200);
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

    sendSuccess(res, "Déconnexion réussie", {}, 200);
};

export const activateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.query;

    if (!token) return sendError(res, "Token manquant", 400);

    try {
        const decoded = jwt.verify(token as string, SECRET) as DecodedToken;
        const user = await User.findByPk(decoded.id);

        if (!user) return sendError(res, "Utilisateur non trouvé", 404);

        if (user.isActive) return sendSuccess(res, "Compte déjà activé", 200);

        user.isActive = true;
        await user.save();

        sendSuccess(res, "Compte activé avec succès !", 200);
    } catch (error: any) {
        if (error.name === "TokenExpiredError")
            return sendError(res, "Token expiré", 400);
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user) await sendPasswordResetEmail(user);

        sendSuccess(res, "Si cet email existe, un lien a été envoyé.", 200);
    } catch (error) {
        next(error);
    }
};

export const confirmPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token, newPassword } = req.body;

    try {
        await resetUserPassword(token, newPassword);
        sendSuccess(res, "Mot de passe réinitialisé avec succès.", 200);
    } catch (error: any) {
        next(error);
    }
};

export const setup2FA = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;

        if (!userId) return sendError(res, "Non autorisé", 401);

        const { qrCodeDataURL, otpauthUrl, secret } = await setupTwoFactor(
            userId
        );
        sendSuccess(
            res,
            "2FA configurée avec succès",
            { qrCodeDataURL, otpauthUrl, secret },
            200
        );
    } catch (err) {
        sendError(res, "Erreur lors de la configuration 2FA", 500);
    }
};

export const enable2FA = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;
        const { code } = req.body;

        if (!userId) return sendError(res, "Non autorisé", 401);
        if (!code) return sendError(res, "Code 2FA requis", 400);

        const isValid = await verifyTwoFactorCode(userId, code);

        if (!isValid) return sendError(res, "Code 2FA invalide", 400);

        sendSuccess(res, "2FA activée avec succès", 200);
    } catch (error) {
        sendError(res, "Erreur lors de l'activation 2FA", 500);
    }
};

export const verifyTwoFactorCodeHandler = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) return sendError(res, "Code 2FA manquant", 400);

        const isValid = await verifyTwoFactorCode(userId, code);

        if (!isValid) return sendError(res, "Code 2FA invalide", 401);

        const token = jwt.sign({ id: userId }, SECRET, {
            expiresIn: "1h",
            audience: AUDIENCE,
            issuer: ISSUER,
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 3600000,
        });

        sendSuccess(res, "2FA vérifiée avec succès", { token }, 200);
    } catch (err: any) {
        sendError(res, "Erreur serveur", 500);
    }
};

export const status2FA = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) return sendError(res, "Utilisateur non trouvé", 404);

        sendSuccess(
            res,
            "Statut 2FA récupéré",
            {
                is2FAEnabled: user.twoFactorEnabled === true,
            },
            200
        );
    } catch (err: any) {
        sendError(res, "Erreur serveur", 500);
    }
};

export const disable2FA = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) return sendError(res, "Utilisateur non trouvé", 404);

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();

        sendSuccess(res, "2FA désactivée avec succès", 200);
    } catch (err: any) {
        sendError(res, "Erreur serveur", 500);
    }
};

export const getAccount = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;

        const user = await User.findOne({
            where: { id: userId },
            attributes: [
                "id",
                "email",
                "acceptedTerms",
                "newsletter",
                "twoFactorEnabled",
            ],
        });

        if (!user) return sendError(res, "Utilisateur non trouvé", 404);

        sendSuccess(res, "Utilisateur trouvé", { account: user }, 200);
    } catch (error) {
        return sendError(res, "Erreur serveur", 500);
    }
};

export const updateEmail = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) return sendError(res, "Non autorisé", 401);
        const userId = req.user.id;
        const { currentPassword, newEmail } = req.body;

        if (!userId) return sendError(res, "Non autorisé", 401);
        if (!currentPassword || !newEmail)
            return sendError(
                res,
                "Mot de passe actuel et nouvel email requis",
                400
            );

        const user = await User.findByPk(userId);

        if (!user) return sendError(res, "Utilisateur non trouvé", 404);

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );
        if (!isPasswordValid)
            return sendError(res, "Mot de passe incorrect", 401);

        const emailInUse = await User.findOne({ where: { email: newEmail } });
        if (emailInUse)
            return sendError(res, "Cet email est déjà utilisé", 409);

        user.email = newEmail;
        user.isActive = false;

        const activationToken = jwt.sign(
            { id: user.id, email: user.email },
            SECRET,
            { expiresIn: "24h" }
        );
        await sendActivationEmail(newEmail, activationToken);

        await user.save();

        sendSuccess(
            res,
            "Email mis à jour avec succès. Veuillez réactiver votre compte.",
            200
        );
    } catch (error) {
        return sendError(res, "Erreur lors de la mise à jour de l'email", 500);
    }
};
