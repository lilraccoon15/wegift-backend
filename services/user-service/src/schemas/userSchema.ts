import { z } from "zod";

export const pseudoSchema = z
    .string()
    .min(3, "Le pseudo doit contenir au moins 3 caractères")
    .max(20, "Le pseudo ne doit pas dépasser 20 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le pseudo contient des caractères invalides");

export const birthDateSchema = z.string().refine(
    (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
    },
    {
        message: "Date de naissance invalide ou dans le futur",
    }
);

export const optionalUrl = z.string().url().nullable().optional();

export const publicProfileSchema = z.object({
    pseudo: pseudoSchema,
    birthDate: birthDateSchema,
    description: z.string().optional(),
    picture: optionalUrl,
});

export const internalProfileSchema = publicProfileSchema.extend({
    userId: z.string().uuid("ID utilisateur invalide"),
});

export const createProfileSchema = internalProfileSchema.partial({
    userId: true,
});

export const updateProfileSchema = publicProfileSchema;

export const getPseudoCheckSchema = z.object({
    pseudo: pseudoSchema,
});

export const friendRequestSchema = z.object({
    addresseeId: z.string().uuid("ID de l'ami requis"),
});

export const respondToFriendRequestSchema = z.object({
    action: z.enum(["accept", "reject"], {
        errorMap: () => ({ message: "Action invalide" }),
    }),
});

export const userSearchQuerySchema = z.object({
    query: z.string().min(1, "La requête est obligatoire"),
});

export const friendshipStatusQuerySchema = z.object({
    user1: z.string().uuid("ID utilisateur 1 invalide"),
    user2: z.string().uuid("ID utilisateur 2 invalide"),
    mode: z.enum(["simple", "full"]).optional(),
});

export const userIdParamSchema = z.object({
    userId: z.string().uuid("ID utilisateur invalide"),
});

export const friendIdParamSchema = z.object({
    friendId: z.string().uuid("ID de l’ami invalide"),
});

export const requesterIdParamSchema = z.object({
    requesterId: z.string().uuid("ID du demandeur invalide"),
});

export type PublicProfileData = z.infer<typeof publicProfileSchema>;
export type InternalProfileData = z.infer<typeof internalProfileSchema>;
export type CreateOrUpdateProfileData = z.infer<typeof createProfileSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type FriendRequestData = z.infer<typeof friendRequestSchema>;
export type RespondToFriendRequestData = z.infer<
    typeof respondToFriendRequestSchema
>;
