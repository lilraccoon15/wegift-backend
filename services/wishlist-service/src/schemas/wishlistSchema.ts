import { z } from "zod";

export const createWishlistSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  published: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val === 0 || val === 1, {
      message: "Published doit être 0 ou 1",
    }),
  access: z.enum(["private", "public"], {
    errorMap: () => ({ message: "Access doit être 'private' ou 'public'" }),
  }),
  mode: z.enum(["individual", "collaborative"], {
    errorMap: () => ({
      message: "Mode doit être 'individual' ou 'collaborative'",
    }),
  }),
  participantIds: z.array(z.string().uuid()).optional(),
});

export const updateWishlistSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  published: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  access: z.enum(["private", "public"]).optional(),
  mode: z.enum(["individual", "collaborative"]).optional(),
  participantIds: z.array(z.string().uuid()).optional(),
});

export const createWishSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  wishlistId: z.string().uuid("ID de wishlist invalide"),
  description: z.string().optional(),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  link: z.string().url("Lien invalide").optional(),
});

export const updateWishSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .optional(),
  link: z.string().url("Lien invalide").optional(),
});

export const searchWishlistSchema = z.object({
  query: z.string().min(1, "La requête est obligatoire"),
});

export const getWishesSchema = z.object({
  wishlistId: z.string().uuid("ID de wishlist invalide"),
});

export const subscribeSchema = z.object({
  wishlistId: z.string().uuid("ID de wishlist invalide"),
});
