import { z } from "zod";

export const firstNameSchema = z.string().min(1, "Le prénom est requis");

export const lastNameSchema = z.string().min(1, "Le nom est requis");

export const birthDateSchema = z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, {
      message: "Date de naissance invalide ou dans le futur",
    });

export const createProfileSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  birthDate: birthDateSchema,
  picture: z.string().optional(),
  description: z.string().max(500).optional(),
});

export const updateProfileSchema = z.object({
  firstName: firstNameSchema.optional(),
  lastName: lastNameSchema.optional(),
  birthDate: birthDateSchema.optional(),
  picture: z.string().optional(),
  description: z.string().max(500).optional(),
});