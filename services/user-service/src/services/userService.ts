import { Friendship, UserProfile } from "../models/setupAssociations";
import {
  AuthError,
  ConflictError,
  NotFoundError,
} from "../errors/CustomErrors";
import { Op, Sequelize } from "sequelize";
import axios from "axios";
import config from "../config";
import { tryDeleteLocalImage } from "../utils/files";

class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

export const insertUserProfile = async (
  userId: number,
  pseudo: string,
  birthDate: string,
  picture?: string | null
) => {
  const existingProfile = await UserProfile.findOne({
    where: { id: userId },
  });
  if (existingProfile)
    throw new ConflictError("Un profil existe déjà pour cet utilisateur.");

  const profile = await UserProfile.create({
    userId,
    pseudo,
    birthDate,
    picture,
  });

  return profile;
};

export const fetchUserProfileByAuthId = async (authId: string) => {
  return await UserProfile.findOne({
    where: { userId: authId },
  });
};

export const fetchMyProfile = async (userId: string) => {
  const profile = await UserProfile.findOne({
    where: { id: userId },
    attributes: ["id", "pseudo", "birthDate", "picture", "description"],
  });
  if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

  return profile;
};

export const fetchUserProfileByUserId = async (userId: string) => {
  const profile = await UserProfile.findOne({
    where: { id: userId },
    attributes: ["id", "pseudo", "birthDate", "picture", "description"],
  });
  if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

  return profile;
};

export const updateProfileDetails = async (
  userId: string,
  pseudo: string,
  birthDate: string,
  picture?: string,
  description?: string
) => {
  const profile = await UserProfile.findOne({ where: { id: userId } });

  if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

  if (profile.userId !== userId) {
    throw new AuthError("Vous n’êtes pas autorisé à modifier ce profil.");
  }

  profile.pseudo = pseudo;
  profile.birthDate = new Date(birthDate);
  if (picture !== undefined) profile.picture = picture;
  if (description !== undefined) profile.description = description;

  await profile.save();

  return profile;
};

export const removeUserProfileByUserId = async (userId: string) => {
  const profile = await UserProfile.findOne({ where: { id: userId } });

  if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

  if (profile.userId !== userId) {
    throw new AuthError("Vous n’êtes pas autorisé à supprimer ce profil.");
  }

  if (profile.picture && !profile.picture.startsWith("http")) {
    tryDeleteLocalImage(profile.picture, "profilePictures");
  }

  await profile.destroy();
};

export async function findFriendshipBetweenUsers(user1: string, user2: string) {
  const friendship = await Friendship.findOne({
    where: {
      [Op.or]: [
        { addresseeId: user1, requesterId: user2 },
        { addresseeId: user2, requesterId: user1 },
      ],
    },
  });

  if (!friendship) throw new NotFoundError("Pas d'amitié trouvée.");

  return friendship;
}

export async function getFriendshipStatusBetween(
  requesterId: string,
  addresseeId: string
) {
  let friendship;
  try {
    friendship = await findFriendshipBetweenUsers(requesterId, addresseeId);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return "none";
    }
    throw err;
  }

  if (!friendship) return "none";

  if (friendship.status === "accepted") return "friends";

  if (friendship.status === "pending") {
    return friendship.requesterId === requesterId
      ? "pending_sent"
      : "pending_received";
  }

  return "unknown";
}

export async function createFriendshipRequest(
  requesterId: string,
  addresseeId: string,
  token: string
) {
  if (requesterId === addresseeId) {
    throw new ValidationError(
      "Vous ne pouvez pas vous envoyer une demande d'ami."
    );
  }

  try {
    await findFriendshipBetweenUsers(requesterId, addresseeId);
    throw new ConflictError("Une relation existe déjà entre ces utilisateurs");
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      throw err;
    }
  }

  const newFriendship = await Friendship.create({
    requesterId,
    addresseeId,
    status: "pending",
  });

  try {
    await axios.post(
      `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
      {
        userId: addresseeId,
        type: "friendship",
        data: { requesterId: requesterId },
        read: false,
      },
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN,
        },
      }
    );
  } catch (error) {
    console.error("Erreur envoi notification:", error);
  }

  return newFriendship;
}

export async function deleteFriendshipRequest(
  requesterId: string,
  addresseeId: string,
  token: string
) {
  if (requesterId === addresseeId) {
    throw new ValidationError("Action non autorisée.");
  }

  const existingRequest = await Friendship.findOne({
    where: {
      requesterId,
      addresseeId,
      status: "pending",
    },
  });

  if (!existingRequest) {
    throw new NotFoundError("Aucune demande à annuler.");
  }

  await existingRequest.destroy();

  try {
    await axios.delete(
      `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/delete-notification`,
      {
        data: {
          userId: addresseeId,
          type: "friendship",
          data: { requesterId },
        },
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN,
        },
      }
    );
  } catch (error) {
    console.error("Erreur suppression notification:", error);
  }

  return true;
}

export async function fetchFriendsByProfileId(
  profileId: string
): Promise<UserProfile[]> {
  const friendships = await Friendship.findAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [{ requesterId: profileId }, { addresseeId: profileId }],
        },
        { status: "accepted" },
      ],
    },
    include: [
      {
        model: UserProfile,
        as: "requester",
        required: false,
        attributes: ["id", "pseudo", "picture"],
      },
      {
        model: UserProfile,
        as: "addressee",
        required: false,
        attributes: ["id", "pseudo", "picture"],
      },
    ],
  });

  if (!friendships || friendships.length === 0) {
    return [];
  }

  const friendProfiles = friendships
    .map((friendship) => {
      const requester = friendship.requester;
      const addressee = friendship.addressee;

      return requester?.id === profileId ? addressee : requester;
    })
    .filter((profile): profile is UserProfile => profile !== undefined);

  return friendProfiles;
}

export type PendingFriend = {
  profile: UserProfile;
  direction: "sent" | "received";
};

export async function fetchPendingFriendsByProfileId(
  profileId: string
): Promise<PendingFriend[]> {
  const friendships = await Friendship.findAll({
    where: {
      [Op.and]: [
        {
          [Op.or]: [{ requesterId: profileId }, { addresseeId: profileId }],
        },
        { status: "pending" },
      ],
    },
    include: [
      {
        model: UserProfile,
        as: "requester",
        required: false,
        attributes: ["id", "pseudo", "picture"],
      },
      {
        model: UserProfile,
        as: "addressee",
        required: false,
        attributes: ["id", "pseudo", "picture"],
      },
    ],
  });

  if (!friendships || friendships.length === 0) {
    return [];
  }

  const pendingList: PendingFriend[] = friendships
    .map((friendship) => {
      const requester = friendship.requester;
      const addressee = friendship.addressee;

      if (!requester || !addressee) return null;

      if (requester.id === profileId) {
        return {
          profile: addressee,
          direction: "sent" as const,
        };
      } else {
        return {
          profile: requester,
          direction: "received" as const,
        };
      }
    })
    .filter((entry): entry is PendingFriend => entry !== null);

  return pendingList;
}

export const searchUserByPseudo = async (query: string, userId: string) => {
  const searchTerm = query.toLowerCase();

  const results = await UserProfile.findAll({
    where: {
      [Op.and]: [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("pseudo")), {
          [Op.like]: `%${searchTerm}%`,
        }),
        {
          id: {
            [Op.ne]: userId,
          },
        },
      ],
    },
  });

  return results;
};

export const removeFriendship = async (userId1: string, userId2: string) => {
  const friendship = await Friendship.findOne({
    where: {
      [Op.or]: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
      status: "accepted",
    },
  });

  if (!friendship) {
    throw new NotFoundError("Relation d’amitié non trouvée.");
  }

  await friendship.destroy();
};

export const respondToFriendRequestService = async (
  userId: string,
  requesterId: string,
  action: "accept" | "reject"
) => {
  const friendship = await Friendship.findOne({
    where: {
      requesterId,
      addresseeId: userId,
      status: "pending",
    },
  });

  if (!friendship) {
    throw new NotFoundError("Demande d'amitié non trouvée.");
  }

  if (action === "accept") {
    friendship.status = "accepted";
  } else if (action === "reject") {
    friendship.status = "rejected";
  } else {
    throw new ValidationError("Action invalide.");
  }

  await friendship.save();

  try {
    await axios.post(
      `${config.apiUrls.NOTIFICATION_SERVICE}/api/internal/send-notification`,
      {
        userId: requesterId,
        type: "friendship-accept",
        data: { from: userId },
        read: false,
      },
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN,
        },
      }
    );
  } catch (error) {
    console.error("Erreur envoi notification:", error);
  }

  return friendship;
};
