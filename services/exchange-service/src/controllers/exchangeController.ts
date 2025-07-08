import {
    createNewExchange,
    deleteExchangeById,
    drawExchangeService,
    getAllExchangeRules,
    getAllMyExchanges,
    getExchangeById,
    respondToExchange,
    searchExchangeByTitle,
    updateExchangeById,
} from "../services/exchangeServices";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";
import {
    AppError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";
import {
    createExchangeSchema,
    respondToExchangeSchema,
    searchExchangeSchema,
    updateExchangeSchema,
} from "../schemas/exchangeSchema";

export const getMyExchanges = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const exchanges = await getAllMyExchanges(userId);

        sendSuccess(res, "Echanges trouvés", { exchanges }, 200);
    }
);

export const getExchangeRules = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const rules = await getAllExchangeRules();

        sendSuccess(res, "Echanges trouvés", { rules }, 200);
    }
);

export const createExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const {
            title,
            description,
            budget,
            endDate,
            startDate,
            participantIds,
            rules,
        } = createExchangeSchema.parse(req.body);

        const picture = req.file
            ? `/uploads/exchangesPictures/${req.file.filename}`
            : undefined;

        const exchange = await createNewExchange(
            userId,
            title,
            "pending",
            new Date(endDate),
            new Date(startDate),
            description,
            picture,
            budget ? parseFloat(budget) : undefined,
            participantIds,
            rules
        );

        return sendSuccess(res, "Echange créé", { exchange });
    }
);

export const updateExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { id } = req.params;
        const userId = req.user.id;

        const {
            title,
            description,
            budget,
            status,
            endDate,
            startDate,
            participantIds,
            rules,
        } = updateExchangeSchema.parse(req.body);

        const picture = req.file
            ? `/uploads/exchangesPictures/${req.file.filename}`
            : undefined;

        const updatedExchange = await updateExchangeById(
            id,
            userId,
            title,
            status,
            new Date(endDate),
            new Date(startDate),
            description,
            picture,
            budget ? parseFloat(budget) : undefined,
            participantIds,
            rules
        );

        return sendSuccess(res, "Échange mis à jour", {
            exchange: updatedExchange,
        });
    }
);

export const deleteExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { id } = req.params;

        if (!id)
            return next(
                new AppError("exchangeId manquant dans la requête", 400)
            );

        await deleteExchangeById(id);
        return sendSuccess(res, "Echange supprimé", {}, 200);
    }
);

export const searchExchange = asyncHandler(async (req, res, next) => {
    const { query } = searchExchangeSchema.parse(req.query);

    const results = await searchExchangeByTitle(query);

    return sendSuccess(res, "Résultats trouvés", { exchanges: results });
});

export const getMyExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;
        const id = req.params.id;

        const exchange = await getExchangeById(id, userId);

        if (!exchange) return next(new NotFoundError("Echange non trouvée"));

        sendSuccess(res, "Echange trouvée", { exchange });
    }
);

export const respondToExchangeInvitation = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { action } = respondToExchangeSchema.parse(req.body);

        const userId = req.user.id;
        const { exchangeId } = req.params;

        await respondToExchange(
            userId,
            exchangeId,
            action as "accept" | "reject"
        );

        sendSuccess(
            res,
            `Invitation ${
                action === "accept" ? "acceptée" : "refusée"
            } avec succès`,
            {},
            200
        );
    }
);

export const drawExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;
        const { exchangeId } = req.params;

        await drawExchangeService(userId, exchangeId);

        sendSuccess(res, "Tirage au sort effectué avec succès.", {}, 200);
    }
);
