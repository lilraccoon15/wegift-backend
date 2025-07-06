import {
    createNewExchange,
    deleteExchangeById,
    getAllExchangeRules,
    getAllMyExchanges,
    getExchangeById,
    searchExchangeByTitle,
    updateExchangeById,
} from "../services/exchangeServices";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";
import { AppError, NotFoundError } from "../errors/CustomErrors";
import Exchange from "../models/Exchange";
import { Op, Sequelize } from "sequelize";

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
        } = req.body;

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
        } = req.body;

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
    const searchTerm = req.query.query;

    if (typeof searchTerm !== "string") {
        return next(
            new AppError("Paramètre 'query' manquant ou invalide", 400)
        );
    }

    const results = await searchExchangeByTitle(searchTerm);

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
