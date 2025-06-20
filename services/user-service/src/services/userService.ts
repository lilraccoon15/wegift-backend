import Friendship from "../models/Friendship";
import { ConflictError, NotFoundError } from "../errors/CustomErrors";
import UserProfile from "../models/UserProfile";
import { Op } from "sequelize";
import axios from "axios";
import config from "../config";

class ValidationError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
    }
}

export const createProfileService = async (
    userId: number,
    firstName: string,
    lastName: string,
    birthDate: string
) => {
    const existingProfile = await UserProfile.findOne({ where: { userId } });
    if (existingProfile)
        throw new ConflictError("Un profil existe déjà pour cet utilisateur.");

    const profile = await UserProfile.create({
        userId,
        firstName,
        lastName,
        birthDate,
    });

    return profile;
};

export const getProfileService = async (userId: number) => {
    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

    return profile;
};

export const updateProfileService = async (
    userId: number,
    firstName: string,
    lastName: string,
    birthDate: string,
    picture?: string,
    description?: string
) => {
    const profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

    profile.firstName = firstName;
    profile.lastName = lastName;
    profile.birthDate = new Date(birthDate);
    if (picture !== undefined) profile.picture = picture;
    if (description !== undefined) profile.description = description;

    await profile.save();

    return profile;
};

export const deleteProfileUser = async (userId: number) => {
    const profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) throw new NotFoundError("Profil utilisateur non trouvé.");

    await profile.destroy();
};

export async function getFriendship(user1: string, user2: string) {
    const friendship = await Friendship.findOne({
        where: {
            [Op.or]: [
                { requesterId: user1, addresseeId: user2 },
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
        friendship = await getFriendship(requesterId, addresseeId);
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

export async function sendFriendshipAsk(
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
        await getFriendship(requesterId, addresseeId);
        throw new ConflictError(
            "Une relation existe déjà entre ces utilisateurs"
        );
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
            `${config.apiUrls.NOTIFICATION_SERVICE}/notifications`,
            {
                recipientId: addresseeId,
                senderId: requesterId,
                type: "friend_request",
                data: JSON.stringify({
                    message: `Nouvelle demande d'ami de ${requesterId}`,
                }),
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
