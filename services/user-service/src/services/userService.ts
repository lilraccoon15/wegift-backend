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

export const getProfileService = async (userId: number) => {
  const profile = await UserProfile.findOne({ where: { userId } });
  return profile;
};
