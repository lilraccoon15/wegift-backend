import {
  cancelDrawExchangeService,
  createNewExchange,
  deleteExchangeById,
  deleteExchangesByUserId,
  drawExchangeService,
  getAllExchangeRules,
  getAllMyExchanges,
  getAllUserExchanges,
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
  AuthError,
  NotFoundError,
  ValidationError,
} from "../errors/CustomErrors";
import {
  createExchangeSchema,
  respondToExchangeSchema,
  searchExchangeSchema,
  updateExchangeSchema,
} from "../schemas/exchangeSchema";
import { deleteImage } from "../utils/deleteImage";

export const getMyExchanges = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;

    const exchanges = await getAllMyExchanges(userId);

    sendSuccess(res, "Echanges trouvés", { exchanges }, 200);
  }
);

export const getExchanges = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.params.userId;
    const userRole = req.params.role;

    const exchanges = await getAllUserExchanges(userId, userRole);

    sendSuccess(res, "Exchanges trouvés", { exchanges });
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

    const picture = req.file
      ? process.env.NODE_ENV === "production"
        ? req.file.path
        : `/uploads/exchangePictures/${req.file.filename}`
      : undefined;

    const exchange = await createNewExchange(
      userId,
      title,
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
    const userRole = req.user.role;

    const file = req.file;

    const {
      title,
      description,
      budget,
      endDate,
      startDate,
      participantIds,
      rules,
    } = updateExchangeSchema.parse(req.body);

    const exchange = await getExchangeById(exchangeId, userId, userRole);
    if (!exchange) return next(new NotFoundError("Échange non trouvé"));

    if (file && exchange.picture) {
      await deleteImage(exchange.picture);
    }

    const picture = req.file
      ? process.env.NODE_ENV === "production"
        ? req.file.path
        : `/uploads/exchangePictures/${req.file.filename}`
      : undefined;

    const updatedExchange = await updateExchangeById(
      exchangeId,
      userId,
      title,
      endDate,
      startDate,
      description,
      picture,
      budget ?? undefined,
      participantIds,
      rules,
      userRole
    );

    return sendSuccess(res, "Échange mis à jour", {
      exchange: updatedExchange,
    });
  }
);

export const deleteExchange = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id)
      return next(new AppError("exchangeId manquant dans la requête", 400));

    await deleteExchangeById(id, userId);
    return sendSuccess(res, "Echange supprimé", {}, 200);
  }
);

export const searchExchange = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { query } = searchExchangeSchema.parse(req.query);
    const userId = req.user.userId;
    const userRole = req.user.role;

    const results = await searchExchangeByTitle(query, userId, userRole);

    return sendSuccess(res, "Résultats trouvés", { exchanges: results });
  }
);

export const getMyExchange = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!id) return next(new ValidationError("L'ID de l'échange est requis"));

    const exchange = await getExchangeById(id, userId);

    if (!exchange) return next(new NotFoundError("Echange non trouvée"));

    sendSuccess(res, "Echange trouvée", { exchange });
  }
);

export const getExchange = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const { id } = req.params;
    const userRole = req.user.role;

    if (!id) return next(new ValidationError("L'ID de l'échange est requis"));

    const exchange = await getExchangeById(id, userId, userRole);

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
      `Invitation ${action === "accept" ? "acceptée" : "refusée"} avec succès`,
      {},
      200
    );
  }
);

export const drawExchange = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
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

export const cancelDrawExchange = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const exchangeId = req.params.exchangeId;
    const userId = req.user?.userId;

    if (!exchangeId || !userId) {
      throw new NotFoundError("Paramètres manquants");
    }

    const cancelled = await cancelDrawExchangeService(exchangeId, userId);

    if (!cancelled) {
      throw new AuthError("Vous n'êtes pas autorisé à annuler ce tirage");
    }

    return sendSuccess(res, "Tirage annulé avec succès");
  }
);
