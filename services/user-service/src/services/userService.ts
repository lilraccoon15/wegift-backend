import { Friendship, UserProfile } from "../models/setupAssociations";
import { ConflictError, NotFoundError } from "../errors/CustomErrors";
import { Op, Sequelize } from "sequelize";
import axios from "axios";
import config from "../config";

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
  picture?: string | null,
  isPublic?: boolean
) => {
  const existingProfile = await UserProfile.findOne({ where: { id: userId } });
  if (existingProfile)
    throw new ConflictError("Un profil existe déjà pour cet utilisateur.");

  const profile = await UserProfile.create({
    userId,
    pseudo,
    birthDate,
    picture,
    isPublic,
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
    attributes: [
      "id",
      "pseudo",
      "birthDate",
      "picture",
      "description",
      "isPublic",
    ],
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
  userId: number,
  pseudo: string,
  birthDate: string,
  picture?: string,
  description?: string
) => {
  const profile = await UserProfile.findOne({ where: { id: userId } });

  if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

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
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Erreur envoi notification:", error);
  }

  return newFriendship;
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

export const searchUserByPseudo = async (query: string, userId: string) => {
  const searchTerm = query.toLowerCase();

  const results = await UserProfile.findAll({
    where: {
      [Op.and]: [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("pseudo")), {
          [Op.like]: `%${searchTerm}%`,
        }),
        {
          [Op.or]: [
            { isPublic: true },
            { "$sentFriendships.status$": "accepted" },
            { "$receivedFriendships.status$": "accepted" },
          ],
        },
      ],
    },
    include: [
      {
        model: Friendship,
        as: "sentFriendships",
        required: false,
        where: {
          requesterId: userId,
          status: "accepted",
        },
        attributes: [],
      },
      {
        model: Friendship,
        as: "receivedFriendships",
        required: false,
        where: {
          addresseeId: userId,
          status: "accepted",
        },
        attributes: [],
      },
    ],
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
  return friendship;

  // TODO : notifier l'acceptation d'amitié
};
