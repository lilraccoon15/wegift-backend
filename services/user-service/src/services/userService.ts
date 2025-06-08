import { ConflictError, NotFoundError } from "../errors/CustomErrors";
import UserProfile from "../models/UserProfile";

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
