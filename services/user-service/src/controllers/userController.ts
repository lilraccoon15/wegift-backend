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
  createOrUpdateProfileSchema,
  deleteProfileSchema,
  friendRequestSchema,
  friendshipStatusQuerySchema,
  respondToFriendRequestSchema,
  userSearchQuerySchema,
} from "../schemas/userSchema";

export const getMyProfile = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

    const profile = await fetchMyProfile(userId);

    if (!profile) return next(new NotFoundError("Profil non trouvé"));

    return sendSuccess(res, "Profil récupéré", { profile });
  }
);

export const createUserProfile = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

    const { pseudo, birthDate } = createOrUpdateProfileSchema.parse(req.body);

    const profile = await insertUserProfile(userId, pseudo, birthDate);

    return sendSuccess(res, "Profil créé", { profile });
  }
);

export const updateUserProfile = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

    const { pseudo, birthDate, description } =
      createOrUpdateProfileSchema.parse(req.body);

    const profile = await fetchUserProfileByUserId(userId);
    if (!profile) return next(new NotFoundError("Profil introuvable"));

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
    const userId = req.user.id;

    await removeUserProfileByUserId(userId);
    return sendSuccess(res, "Profil utilisateur supprimé", {}, 200);
  }
);

export const getUserProfileById = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;

    if (!id) return next(new AppError("userId manquant dans la requête", 400));

    const user = await fetchUserProfileByUserId(id);

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
    const { user1, user2, mode } = friendshipStatusQuerySchema.parse(req.query);

    if (mode === "simple") {
      const friendship = await findFriendshipBetweenUsers(user1, user2);
      return sendSuccess(res, "Relation d'amitié vérifiée", {
        areFriends: !!friendship,
      });
    } else {
      const status = await getFriendshipStatusBetween(user1, user2);
      return sendSuccess(res, "Statut récupéré", { status });
    }
  }
);

export const sendFriendRequest = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const requesterUserId = req.user.id;
    const { addresseeId } = friendRequestSchema.parse(req.body);
    const token = req.cookies.token;

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

export const getMyFriendList = asyncHandler(
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
  const { query } = userSearchQuerySchema.parse(req.query);

  const results = await searchUserByPseudo(query);

  return sendSuccess(res, "Résultats trouvés", { users: results });
});

export const deleteFriend = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { friendId } = req.params;

    await removeFriendship(userId, friendId);

    sendSuccess(res, "Ami supprimé avec succès", {}, 200);
  }
);

export const respondToFriendRequest = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { requesterId } = req.params;
    const { action } = respondToFriendRequestSchema.parse(req.body);

    await respondToFriendRequestService(
      userId,
      requesterId,
      action as "accept" | "reject"
    );

    sendSuccess(
      res,
      `Demande ${action === "accept" ? "acceptée" : "refusée"} avec succès`,
      {},
      200
    );
  }
);
