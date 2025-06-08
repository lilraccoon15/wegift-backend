import bcrypt from "bcrypt";
import User from "../models/User";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { RegisterData } from "../schemas/authSchema";
import axios from "axios";
import { sendActivationEmail, sendResetPasswordEmail } from "./emailService";
import PasswordResetToken from "../models/PasswordResetToken";
import logger from "../utils/logger";
import * as crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import config from "../config";
import { ConflictError, NotFoundError } from "src/errors/CustomErrors";

interface DecodedToken {
    id: number;
    iat?: number;
    exp?: number;
    firstName: string;
    lastName: string;
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
    | { token: string }
    | { requires2FA: true; tempToken: string }
    | { error: string };

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
        throw new ValidationError(
            "Vous devez accepter les conditions générales d'utilisation."
        );
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ConflictError("Cet email est déjà enregistré.");
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
            firstName,
            lastName,
            birthDate: birth.toISOString(),
        },
        config.jwtSecret,
        {
            expiresIn: "24h",
        }
    );

    try {
        await sendActivationEmail(email, activationToken);
    } catch (error) {
        logger.error("Erreur envoi mail d'activation :", error);
        throw new Error("Impossible d'envoyer le mail d'activation.");
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
            config.jwtSecret,
            { expiresIn: "5m" }
        );

        return { requires2FA: true, tempToken };
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        {
            expiresIn: "1h",
            audience: config.jwtAudience,
            issuer: config.jwtIssuer,
        }
    );

    return { token };
};

export const activateUser = async (token: string) => {
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
            `${config.apiUrls.USER_SERVICE}/profile`,
            {
                userId: user.id,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                birthDate: decoded.birthDate,
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
            "Erreur création du profil utilisateur :",
            err.response?.data || err.message || err
        );
        throw new Error("ProfileCreationFailed");
    }

    return "Success";
};

export const sendPasswordResetEmail = async (user: any) => {
    const token = crypto.randomBytes(32).toString("hex");

    await PasswordResetToken.upsert({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + config.tokenExpirationMs),
    });

    await sendResetPasswordEmail(user.email, token);
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

export const setupTwoFactor = async (userId: number) => {
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

export const verifyTwoFactorCode = async (
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

export const verifyTwoFactorCodeAndGenerateToken = async (
    userId: number,
    code: string
) => {
    if (!code) throw new ValidationError("Code 2FA manquant.");

    const isValid = await verifyTwoFactorCode(userId, code);
    if (!isValid) throw new ValidationError("Code 2FA invalide.");

    const token = jwt.sign({ id: userId }, config.jwtSecret, {
        expiresIn: "1h",
        audience: config.jwtAudience,
        issuer: config.jwtIssuer,
    });

    return token;
};

export const disableTwoFactorAuth = async (userId: number) => {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError("Utilisateur non trouvé.");

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();
    return;
};

export const getAccountById = async (userId: number) => {
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

    if (!user)  throw new NotFoundError("Utilisateur non trouvé.");

    return user;
};

export const updateEmailForUser = async (
    userId: number,
    currentPassword: string,
    newEmail: string
) => {
    const user = await User.findByPk(userId);
    if (!user)  throw new NotFoundError("Utilisateur non trouvé.");

    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
    );
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

    await sendActivationEmail(newEmail, activationToken);
};
