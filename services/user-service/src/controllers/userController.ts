import sendSuccess from "../utils/sendSuccess";
import {
    createProfileService,
    deleteProfileUser,
    getFriendship,
    getFriendshipStatusBetween,
    getProfileService,
    sendFriendshipAsk,
    updateProfileService,
} from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";

import UserProfile from "../models/UserProfile";
import path from "path";
import fs from "fs";
import { AppError, NotFoundError } from "../errors/CustomErrors";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Op } from "sequelize";
import Friendship from "../models/Friendship";

export const me = asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

    const profile = await getProfileService(userId);

    if (!profile) return next(new NotFoundError("Profil non trouvé"));

    return sendSuccess(res, "Profil récupéré", profile);
});

export const createProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const { firstName, lastName, birthDate } = req.body;

        const profile = await createProfileService(
            userId,
            firstName,
            lastName,
            birthDate
        );

        return sendSuccess(res, "Profil créé", profile);
    }
);

export const getCurrentUser = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const user = await UserProfile.findOne({
            where: { userId },
            attributes: [
                "id",
                "firstName",
                "lastName",
                "birthDate",
                "picture",
                "description",
            ],
        });

        if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

        sendSuccess(res, "Utilisateur trouvé", { user }, 200);
    }
);

export const updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const { firstName, lastName, birthDate, description } = req.body;

        const file = req.file;

        if (file) {
            const uploadDir = path.join(
                __dirname,
                "../../public/uploads/profilePictures/"
            );
            const files = fs.readdirSync(uploadDir);

            files.forEach((fileInDir) => {
                if (
                    fileInDir.startsWith(`profile_${userId}_pp`) &&
                    fileInDir !== file.filename
                ) {
                    fs.unlinkSync(path.join(uploadDir, fileInDir));
                }
            });
        }

        const picture = req.file
            ? `/uploads/profilePictures/${req.file.filename}`
            : undefined;

        const updatedProfile = await updateProfileService(
            userId,
            firstName,
            lastName,
            birthDate,
            picture,
            description
        );

        return sendSuccess(res, "Profil mis à jour", updatedProfile);
    }
);

export const deleteProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { userId } = req.body;

        if (!userId)
            return next(new AppError("userId manquant dans la requête", 400));

        await deleteProfileUser(userId);
        return sendSuccess(res, "Profil utilisateur supprimé", {}, 200);
    }
);

export const getUser = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { id } = req.params;

        if (!id)
            return next(new AppError("userId manquant dans la requête", 400));

        const user = await UserProfile.findByPk(id);

        if (!user) return next(new NotFoundError("Profil non trouvé"));

        return sendSuccess(res, "Profil utilisateur trouvé", { user }, 200);
    }
);

export const areFriends = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const user1 = req.query.user1 as string;
        const user2 = req.query.user2 as string;

        if (!user1 || !user2)
            return next(new AppError("Les deux IDs doivent être fournis", 400));

        const friendship = await getFriendship(user1, user2);

        return sendSuccess(res, "Relation d'amitié vérifiée", {
            areFriends: !!friendship,
        });
    }
);

export const getFriendshipStatus = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const requesterId = req.query.user1 as string;
        const addresseeId = req.query.user2 as string;

        if (!requesterId || !addresseeId)
            return next(new AppError("Les deux IDs doivent être fournis", 400));

        const status = await getFriendshipStatusBetween(
            requesterId,
            addresseeId
        );
        return sendSuccess(res, "Statut récupéré", { status });
    }
);

export const askFriendship = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const requesterUserId = req.user?.id;
        const { addresseeId } = req.body;
        const token = req.cookies.token;

        if (!requesterUserId || !addresseeId) {
            return next(new AppError("Les deux IDs doivent être fournis", 400));
        }

        if (!token) {
            return next(new AppError("Token manquant", 401));
        }

        const requesterProfile = await UserProfile.findOne({
            where: { userId: requesterUserId },
        });
        if (!requesterProfile) {
            return next(new AppError("Profil du demandeur non trouvé", 404));
        }
        const ask = await sendFriendshipAsk(requesterProfile.id, addresseeId, token);

        return sendSuccess(res, "Demande d'ami envoyée", { ask });
    }
);
