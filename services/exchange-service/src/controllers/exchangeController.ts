import {
    createNewExchange,
    deleteExchangeById,
    deleteExchangesByUserId,
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
import { getUploadedPicturePath } from "../utils/files";

export const getMyExchanges = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.userId;

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
        const userId = req.user.userId;

        const {
            title,
            description,
            budget,
            endDate,
            startDate,
            participantIds,
            rules,
        } = createExchangeSchema.parse(req.body);

        const picture = getUploadedPicturePath(req.file, "exchangesPictures");

        const exchange = await createNewExchange(
            userId,
            title,
            "pending",
            endDate,
            startDate,
            description,
            picture,
            budget ?? undefined,
            participantIds,
            rules
        );

        return sendSuccess(res, "Echange créé", { exchange });
    }
);

export const updateExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { exchangeId } = req.params;
        const userId = req.user.userId;

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

        const picture = getUploadedPicturePath(req.file, "exchangesPictures");

        const updatedExchange = await updateExchangeById(
            exchangeId,
            userId,
            title,
            status,
            endDate,
            startDate,
            description,
            picture,
            budget ?? undefined,
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
        const { exchangeId } = req.params;

        if (!exchangeId)
            return next(
                new AppError("exchangeId manquant dans la requête", 400)
            );

        await deleteExchangeById(exchangeId);
        return sendSuccess(res, "Echange supprimé", {}, 200);
    }
);

export const searchExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { query } = searchExchangeSchema.parse(req.query);
        const { userId } = req.user.userId;

        const results = await searchExchangeByTitle(query, userId);

        return sendSuccess(res, "Résultats trouvés", { exchanges: results });
    }
);

export const getMyExchange = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.userId;
        const { exchangeId } = req.params;

        const exchange = await getExchangeById(exchangeId, userId);

        if (!exchange) return next(new NotFoundError("Echange non trouvée"));

        sendSuccess(res, "Echange trouvée", { exchange });
    }
);

export const respondToExchangeInvitation = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { action } = respondToExchangeSchema.parse(req.body);

        const userId = req.user.userId;
        const { exchangeId } = req.params;

        await respondToExchange(userId, exchangeId, action);

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
        const userId = req.user.userIdd;
        const { exchangeId } = req.params;

        await drawExchangeService(userId, exchangeId);

        sendSuccess(res, "Tirage au sort effectué avec succès.", {}, 200);
    }
);

export const deleteUserExchanges = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { userId } = req.body;

        if (!userId)
            return next(new ValidationError("L'ID utilisateur est requis."));

        await deleteExchangesByUserId(userId);
        return sendSuccess(res, "Echange supprimé", {}, 200);
    }
);
