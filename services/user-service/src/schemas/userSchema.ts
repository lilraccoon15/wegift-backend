import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom est requis."),
  birthDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "La date de naissance est invalide." }),
  email: z.string().email("Email invalide."),
  password: z.string().refine((val) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val),
    {
      message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
    }
  ),
  acceptedTerms: z.literal(true),
  newsletter: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type RegisterData = z.infer<typeof registerSchema>;
