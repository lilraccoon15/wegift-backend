import { boolean, z } from "zod";

export const emailSchema = z.string().email("Email invalide.");

export const emailObjectSchema = z.object({
    email: emailSchema,
});

export const passwordSchema = z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Une majuscule est requise")
    .regex(/[a-z]/, "Une minuscule est requise")
    .regex(/\d/, "Un chiffre est requis")
    .regex(/[!@#$%^&*(),.?":{}|<>+]/, "Un caractère spécial est requis");

export const createPasswordSchema = z.object({
    password: passwordSchema,
});

export const registerSchema = z.object({
    pseudo: z
        .string()
        .min(3, "Le pseudo doit contenir au moins 3 caractères.")
        .max(30, "Le pseudo ne doit pas dépasser 30 caractères.")
        .regex(
            /^[a-zA-Z0-9_\-]+$/,
            "Le pseudo contient des caractères invalides"
        ),
    birthDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "La date de naissance est invalide.",
        })
        .refine(
            (date) => {
                const d = new Date(date);
                const now = new Date();
                const minAge = 12;
                return d < now && now.getFullYear() - d.getFullYear() >= minAge;
            },
            {
                message: "Vous devez avoir au moins 12 ans.",
            }
        ),
    email: emailSchema,
    password: passwordSchema,
    acceptedTerms: z.boolean().refine((val) => val === true, {
        message: "Vous devez accepter les conditions générales d'utilisation.",
    }),
    newsletter: z.boolean(),
    role: z.undefined().optional(),
});

export const loginSchema = z.object({
    email: z.string().email("Email invalide."),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Le token est requis."),
    newPassword: passwordSchema,
});

export const validate2FASchema = z.object({
    code: z.string().min(1, "Le code 2FA est requis"),
});

export const changeEmailSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newEmail: emailSchema,
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: passwordSchema,
});

export const newsletterSchema = z.object({
    newsletter: z.boolean(),
});

export const removeUserSchema = z.object({
    password: z.string().min(1, "Le mot de passe est requis"),
});

export const activationTokenSchema = z.object({
    token: z.string().min(1, "Token d'activation requis."),
});

export type RegisterData = z.infer<typeof registerSchema>;
