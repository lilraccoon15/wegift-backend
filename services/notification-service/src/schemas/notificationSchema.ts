import { z } from "zod";

export const sendNotificationSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide"),
  type: z.string().min(1, "Le type de notification est requis"),
  data: z.any(),
  read: z.boolean().optional(),
});

export const userIdQuerySchema = z.object({
  userId: z.string().uuid("ID utilisateur requis"),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type UserIdQuery = z.infer<typeof userIdQuerySchema>;
