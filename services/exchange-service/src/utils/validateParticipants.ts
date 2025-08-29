import { ValidationError } from "../errors/CustomErrors";
import config from "../config";
import axios from "axios";

export const validateParticipants = async (
  userId: string,
  participantIds: string[]
): Promise<string[]> => {
  const uniqueParticipantIds = [...new Set(participantIds)];

  console.log(uniqueParticipantIds);

  if (uniqueParticipantIds.includes(userId)) {
    throw new ValidationError(
      "Vous ne pouvez pas vous ajouter vous-même comme participant."
    );
  }

  try {
    const response = await axios.post(
      `${config.apiUrls.USER_SERVICE}/validate-ids`,
      { userIds: uniqueParticipantIds },
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN!,
        },
      }
    );

    const validUserIds: string[] = response.data.validUserIds;

    console.log(validUserIds);

    if (validUserIds.length !== uniqueParticipantIds.length) {
      throw new ValidationError(
        "Certains participants sont invalides ou inexistants."
      );
    }

    return validUserIds;
  } catch (error) {
    throw new ValidationError(
      "Erreur lors de la vérification des utilisateurs."
    );
  }
};
