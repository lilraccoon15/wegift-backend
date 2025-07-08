import { z } from "zod";

export const createOrUpdateProfileSchema = z.object({
  pseudo: z.string().min(1, "Le pseudo est requis"),
  birthDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    },
    {
      message: "Date de naissance invalide ou dans le futur",
    }
  ),
  description: z.string().optional(),
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

export const deleteProfileSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide"),
});

export type CreateOrUpdateProfileData = z.infer<
  typeof createOrUpdateProfileSchema
>;
export type FriendRequestData = z.infer<typeof friendRequestSchema>;
export type RespondToFriendRequestData = z.infer<
  typeof respondToFriendRequestSchema
>;
