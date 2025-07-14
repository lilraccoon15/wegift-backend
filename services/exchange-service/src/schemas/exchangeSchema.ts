import { z } from "zod";

const parseDate = z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
        message: "Date invalide",
    })
    .transform((val) => new Date(val));

const exchangeBaseShape = {
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().optional(),
    budget: z
        .union([z.string(), z.number()])
        .transform((val) => parseFloat(val as string))
        .optional(),
    startDate: parseDate,
    endDate: parseDate,
    participantIds: z.array(z.string().uuid()).optional(),
    rules: z.array(z.string().uuid()).optional(),
};

const validateDates = (data: any, ctx: z.RefinementCtx) => {
    if (data.startDate >= data.endDate) {
        ctx.addIssue({
            path: ["startDate"],
            code: z.ZodIssueCode.custom,
            message: "La date de début doit être avant la date de fin.",
        });
    }
};

export const createExchangeSchema = z
    .object(exchangeBaseShape)
    .superRefine(validateDates);

export const updateExchangeSchema = z
    .object({
        ...exchangeBaseShape,
        status: z.enum(["pending", "active", "finished"], {
            errorMap: () => ({ message: "Statut invalide" }),
        }),
    })
    .superRefine(validateDates);

export const searchExchangeSchema = z.object({
    query: z.string().min(1, "La requête est obligatoire"),
});

export const respondToExchangeSchema = z.object({
    action: z.enum(["accept", "reject"], {
        errorMap: () => ({ message: "Action invalide" }),
    }),
});

export type CreateExchangeData = z.infer<typeof createExchangeSchema>;
export type UpdateExchangeData = z.infer<typeof updateExchangeSchema>;
export type RespondToExchangeData = z.infer<typeof respondToExchangeSchema>;
