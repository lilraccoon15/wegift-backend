import { z } from "zod";

export const createProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, {
      message: "Date de naissance invalide ou dans le futur",
    }),
});