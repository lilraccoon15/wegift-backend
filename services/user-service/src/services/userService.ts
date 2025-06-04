import UserProfile from "../models/UserProfile";

export const createProfileService = async (
  userId: number,
  firstName: string,
  lastName: string,
  birthDate: string
) => {
  const existingProfile = await UserProfile.findOne({ where: { userId } });
  if (existingProfile) {
    throw new Error("Profil déjà existant");
  }

  const profile = await UserProfile.create({
    userId,
    firstName,
    lastName,
    birthDate,
  });

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

  if (!profile) {
    throw new Error("Profil non trouvé");
  }

  profile.firstName = firstName;
  profile.lastName = lastName;
  profile.birthDate = new Date(birthDate);
  if (picture !== undefined) profile.picture = picture;
  if (description !== undefined) profile.description = description;

  await profile.save();

  return profile;
};
