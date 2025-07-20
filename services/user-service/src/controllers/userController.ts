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
    searchUserByPseudo,
    removeFriendship,
    respondToFriendRequestService,
    fetchMyProfile,
    fetchUserProfileByAuthId,
    fetchPendingFriendsByProfileId,
    deleteFriendshipRequest,
} from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";

import UserProfile from "../models/UserProfile";
import path from "path";
import fs from "fs";
import {
    AppError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
    createProfileSchema,
    friendIdParamSchema,
    friendRequestSchema,
    friendshipStatusQuerySchema,
    getPseudoCheckSchema,
    requesterIdParamSchema,
    respondToFriendRequestSchema,
    updateProfileSchema,
    userIdParamSchema,
    userSearchQuerySchema,
} from "../schemas/userSchema";
import { getUploadFolderPath } from "../utils/files";

export const getMyProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.userId;

        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const profile = await fetchMyProfile(userId);
        if (!profile) return next(new NotFoundError("Profil non trouvé"));

        return sendSuccess(res, "Profil récupéré", { profile });
    }
);

export const createUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const {
            userId: bodyUserId,
            pseudo,
            birthDate,
            picture,
            description,
            isPublic,
        } = createProfileSchema.parse(req.body);

        const userId = bodyUserId || req.user?.userId;

        if (!userId) throw new ValidationError("userId manquant");

        const profile = await insertUserProfile(
            userId,
            pseudo,
            birthDate,
            picture,
            isPublic
        );

        return sendSuccess(res, "Profil créé", { profile });
    }
);

export const checkPseudoAvailability = asyncHandler(async (req, res, next) => {
    const { pseudo } = getPseudoCheckSchema.parse(req.query);
    const existingUser = await UserProfile.findOne({ where: { pseudo } });

    sendSuccess(res, "Disponibilité du pseudo vérifiée", {
        available: !existingUser,
    });
});

export const getUserProfileByAuthId = asyncHandler(async (req, res, next) => {
    const { authId } = req.params;

    const user = await fetchUserProfileByAuthId(authId);

    if (!user) {
        return next(
            new NotFoundError(
                "Aucun profil associé à cet ID d’authentification."
            )
        );
    }

    sendSuccess(res, "Profil trouvé", { profile: user }, 200);
});

export const updateUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.userId;

        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const { pseudo, birthDate, description, picture } =
            updateProfileSchema.parse(req.body);

        const profile = await fetchMyProfile(userId);
        if (!profile) return next(new NotFoundError("Profil introuvable"));

        if (req.file) {
            const uploadDir = getUploadFolderPath("profilePictures");
            const files = fs.readdirSync(uploadDir);
            // todo vérifier la suppression de l'ancienne photo
            files.forEach((fileInDir) => {
                if (
                    fileInDir.startsWith(`profile_${userId}_pp`) &&
                    fileInDir !== req.file!.filename
                ) {
                    fs.unlinkSync(path.join(uploadDir, fileInDir));
                }
            });
        }

        const finalPicture = req.file
            ? `/uploads/profilePictures/${req.file.filename}`
            : picture ?? undefined;

        const updatedProfile = await updateProfileDetails(
            userId,
            pseudo,
            birthDate,
            finalPicture,
            description
        );

        return sendSuccess(res, "Profil mis à jour", {
            profile: updatedProfile,
        });
    }
);

export const deleteUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.userId;
        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        await removeUserProfileByUserId(userId);
        return sendSuccess(res, "Profil utilisateur supprimé", {}, 200);
    }
);

export const getUserProfileById = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { userId } = userIdParamSchema.parse(req.params);

        const user = await fetchUserProfileByUserId(userId);

        if (!user) return next(new NotFoundError("Profil non trouvé"));

        return sendSuccess(
            res,
            "Profil utilisateur trouvé",
            { profile: user },
            200
        );
    }
);

export const getFriendshipStatus = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { user1, user2, mode } = friendshipStatusQuerySchema.parse(
            req.query
        );

        if (mode === "simple") {
            const friendship = await findFriendshipBetweenUsers(user1, user2);
            return sendSuccess(res, "Relation d'amitié vérifiée", {
                areFriends: !!friendship,
            });
        }

        const status = await getFriendshipStatusBetween(user1, user2);
        return sendSuccess(res, "Statut récupéré", { status });
    }
);

export const sendFriendRequest = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const requesterUserId = req.user.userId;
        const { addresseeId } = friendRequestSchema.parse(req.body);
        const token = req.cookies.token;

        if (!token) {
            return next(new AppError("Token manquant", 401));
        }

        const ask = await createFriendshipRequest(
            requesterUserId,
            addresseeId,
            token
        );

        return sendSuccess(res, "Demande d'ami envoyée", { ask });
    }
);

export const getMyFriendList = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.userId;
        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const profileId = await UserProfile.findOne({
            where: { id: userId },
        });

        if (!profileId) return next(new AppError("Profil non trouvé", 404));

        const friendships = await fetchFriendsByProfileId(profileId.id);

        if (friendships.length === 0)
            return sendSuccess(res, "Aucun ami trouvé", { friendships: [] });

        return sendSuccess(res, "Amitiés récupérées", { friendships });
    }
);

export const getMyPendingFriendList = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.userId;
        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const pendings = await fetchPendingFriendsByProfileId(userId);

        if (pendings.length === 0)
            return sendSuccess(res, "Aucun ami trouvé", { pendings: [] });

        return sendSuccess(res, "Amitiés récupérées", { pendings });
    }
);

export const getFriendList = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { userId } = userIdParamSchema.parse(req.params);

        const profileId = await UserProfile.findOne({
            where: { id: userId },
        });

        if (!profileId) return next(new AppError("Profil non trouvé", 404));

        const friendships = await fetchFriendsByProfileId(profileId.id);

        if (friendships.length === 0)
            return sendSuccess(res, "Aucun ami trouvé", { friendships: [] });

        return sendSuccess(res, "Amitiés récupérées", { friendships });
    }
);

export const searchUser = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { query } = userSearchQuerySchema.parse(req.query);

        const userId = req.user.userId;
        const userRole = req.user.role;

        const results = await searchUserByPseudo(query, userId, userRole);

        return sendSuccess(res, "Résultats trouvés", { users: results });
    }
);

export const deleteFriend = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.userId;
        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const { friendId } = friendIdParamSchema.parse(req.params);

        await removeFriendship(userId, friendId);

        sendSuccess(res, "Ami supprimé avec succès", {}, 200);
    }
);

export const deleteFriendRequest = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user?.userId;
        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const { addresseeId } = friendRequestSchema.parse(req.body);
        const token = req.cookies.token;

        if (!token) return next(new AppError("Token manquant", 401));

        const profile = await fetchMyProfile(userId);
        if (!profile) return next(new NotFoundError("Profil non trouvé"));

        await deleteFriendshipRequest(profile.id, addresseeId, token);

        return sendSuccess(res, "Demande d'ami annulée", {}, 200);
    }
);

export const respondToFriendRequest = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.userId;
        if (!userId)
            return next(new ValidationError("ID utilisateur manquant"));

        const { requesterId } = requesterIdParamSchema.parse(req.params);
        const { action } = respondToFriendRequestSchema.parse(req.body);

        await respondToFriendRequestService(userId, requesterId, action);

        sendSuccess(
            res,
            `Demande ${
                action === "accept" ? "acceptée" : "refusée"
            } avec succès`,
            {},
            200
        );
    }
);

export const updateProfileVisibility = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.userId;
        const { isPublic } = req.body;

        const profile = await UserProfile.findOne({ where: { id: userId } });
        if (!profile) throw new NotFoundError("Profil introuvable.");

        profile.isPublic = isPublic;
        await profile.save();

        sendSuccess(res, "Visibilité mise à jour", { isPublic }, 200);
    }
);
