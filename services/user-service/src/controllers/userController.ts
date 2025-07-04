import sendSuccess from "../utils/sendSuccess";
import {
    insertUserProfile,
    removeUserProfileByUserId,
    findFriendshipBetweenUsers,
    fetchFriendsByProfileId,
    getFriendshipStatusBetween,
    fetchUserProfileByUserId,
    createFriendshipRequest,
    updateProfileDetails,
} from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";

import UserProfile from "../models/UserProfile";
import path from "path";
import fs from "fs";
import { AppError, NotFoundError } from "../errors/CustomErrors";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Op, Sequelize } from "sequelize";

export const getUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const profile = await fetchUserProfileByUserId(userId);

        if (!profile) return next(new NotFoundError("Profil non trouvé"));

        return sendSuccess(res, "Profil récupéré", { profile });
    }
);

export const createUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const { pseudo, birthDate } = req.body;

        const profile = await insertUserProfile(userId, pseudo, birthDate);

        return sendSuccess(res, "Profil créé", { profile });
    }
);

export const getCurrentUserBasicInfo = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const user = await UserProfile.findOne({
            where: { userId },
            attributes: ["id", "pseudo", "birthDate", "picture", "description"],
        });

        if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

        sendSuccess(res, "Utilisateur trouvé", { profile: user }, 200);
    }
);

export const updateUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const { pseudo, birthDate, description } = req.body;

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

        const updatedProfile = await updateProfileDetails(
            userId,
            pseudo,
            birthDate,
            picture,
            description
        );

        return sendSuccess(res, "Profil mis à jour", {
            profile: updatedProfile,
        });
    }
);

export const deleteUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { userId } = req.body;

        if (!userId)
            return next(new AppError("userId manquant dans la requête", 400));

        await removeUserProfileByUserId(userId);
        return sendSuccess(res, "Profil utilisateur supprimé", {}, 200);
    }
);

export const getUserProfileById = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { id } = req.params;

        if (!id)
            return next(new AppError("userId manquant dans la requête", 400));

        const user = await UserProfile.findByPk(id);

        if (!user) return next(new NotFoundError("Profil non trouvé"));

        return sendSuccess(
            res,
            "Profil utilisateur trouvé",
            { profile: user },
            200
        );
    }
);

export const checkFriendshipStatus = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const user1 = req.query.user1 as string;
        const user2 = req.query.user2 as string;

        if (!user1 || !user2)
            return next(new AppError("Les deux IDs doivent être fournis", 400));

        const friendship = await findFriendshipBetweenUsers(user1, user2);

        return sendSuccess(res, "Relation d'amitié vérifiée", {
            areFriends: !!friendship,
        });
    }
);

export const getFriendshipStatusBetweenUsers = asyncHandler(
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

export const sendFriendRequest = asyncHandler(
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
        const ask = await createFriendshipRequest(
            requesterProfile.id,
            addresseeId,
            token
        );

        return sendSuccess(res, "Demande d'ami envoyée", { ask });
    }
);

export const getFriendsListForUser = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.id;

        const profileId = await UserProfile.findOne({
            where: { userId: userId },
        });

        if (!profileId) return next(new AppError("Profil non trouvé", 404));

        const friendships = await fetchFriendsByProfileId(profileId.id);

        if (friendships.length === 0)
            return sendSuccess(res, "Aucun ami trouvé", { friendships: [] });

        return sendSuccess(res, "Amitiés récupérées", { friendships });
    }
);

export const searchUser = asyncHandler(async (req, res, next) => {
    const searchTerm = req.query.query;

    if (typeof searchTerm !== "string") {
        return next(
            new AppError("Paramètre 'query' manquant ou invalide", 400)
        );
    }

    const results = await UserProfile.findAll({
        where: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("pseudo")), {
            [Op.like]: `%${searchTerm.toLowerCase()}%`,
        }),
    });

    return sendSuccess(res, "Résultats trouvés", { users: results });
});
