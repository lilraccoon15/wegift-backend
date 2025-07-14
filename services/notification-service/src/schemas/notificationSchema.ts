import { z } from "zod";

export const sendNotificationSchema = z.object({
    userId: z.string().uuid("ID utilisateur invalide"),
    type: z.string().min(1, "Le type de notification est requis"),
    data: z.any(),
    read: z.boolean().optional(),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
