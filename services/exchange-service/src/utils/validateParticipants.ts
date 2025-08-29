import { ValidationError } from "../errors/CustomErrors";
import config from "../config";
import axios from "axios";

export const validateParticipants = async (
  userId: string,
  participantIds: string[]
): Promise<string[]> => {
  const uniqueParticipantIds = [...new Set(participantIds)];

  console.log("[validateParticipants] INPUT", {
    userId,
    participantIds,
    uniqueParticipantIds,
    url: `${config.apiUrls.USER_SERVICE}/api/internal/validate-ids`,
    token: process.env.INTERNAL_API_TOKEN,
  });

  if (uniqueParticipantIds.includes(userId)) {
    throw new ValidationError(
      "Vous ne pouvez pas vous ajouter vous-même comme participant."
    );
  }

  try {
    const response = await axios.post(
      `${config.apiUrls.USER_SERVICE}/api/internal/validate-ids`,
      { userIds: uniqueParticipantIds },
      {
        headers: {
          "x-internal-token": process.env.INTERNAL_API_TOKEN!,
        },
      }
    );

    console.log("[validateParticipants] RESPONSE", response.data);

    const validUserIds: string[] = response.data.data.validUserIds;

    console.log(validUserIds);

    if (validUserIds.length !== uniqueParticipantIds.length) {
      throw new ValidationError(
        "Certains participants sont invalides ou inexistants."
      );
    }

    return validUserIds;
  } catch (error: any) {
    console.error("[validateParticipants] ERROR", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new ValidationError(
      "Erreur lors de la vérification des utilisateurs."
    );
  }
};
