import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import Wishlist from "../models/Wishlist";
import Wish from "../models/Wish";
import sendSuccess from "../utils/sendSuccess";
import {
  addNewWishToWishlist,
  createNewWishlist,
  deleteWishlistById,
  deleteWishById,
  findProductsByQuery,
  modifyWishlistById,
  modifyWishById,
  getAllUserWishlists,
  getMyWishlistById,
  getWishesByWishlistId,
  findWishById,
  getAllMyWishlists,
  searchWishlistByTitle,
  leaveWishlistAsCollaborator,
  subscribeToWishlistService,
  unsubscribeFromWishlistService,
  getWishlistById,
  getMyWishesByWishlistId,
  findMyWishById,
  canAccessWishlist,
  deleteWishlistsByUserId,
  cancelReservationService,
  reserveWishService,
  getReservedWishesByUser,
} from "../services/wishlistService";
import path from "path";
import fs from "fs";
import {
  AppError,
  AuthError,
  NotFoundError,
  ValidationError,
} from "../errors/CustomErrors";
import {
  createWishlistSchema,
  createWishSchema,
  getWishesSchema,
  searchWishlistSchema,
  subscribeSchema,
  updateWishlistSchema,
  updateWishSchema,
} from "../schemas/wishlistSchema";
import { deleteFileIfExists } from "../utils/files";
import Subscriber from "../models/Subscribers";

export const getMyWishlists = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    if (!userId) return next(new ValidationError("ID utilisateur manquant"));

    const wishlists = await getAllMyWishlists(userId);

    sendSuccess(res, "Wishlists trouvées", { wishlists });
  }
);

export const getWishlists = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const targetUserId = req.params.userId;
    const currentUserRole = req.user.role;
    const currentUserId = req.user.userId;

    const wishlists = await getAllUserWishlists(
      targetUserId,
      currentUserRole,
      currentUserId
    );

    sendSuccess(res, "Wishlists trouvées", { wishlists });
  }
);

export const createWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;

    const { title, description, published, access, mode, participantIds } =
      createWishlistSchema.parse(req.body);

    const picture = req.file
      ? `/uploads/wishlistPictures/${req.file.filename}`
      : undefined;

    const wishlist = await createNewWishlist(
      userId,
      title,
      published,
      access,
      mode,
      description,
      picture,
      participantIds
    );

    return sendSuccess(res, "Wishlist créée", { wishlist });
  }
);

export const getMyWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const id = req.params.id;

    const wishlist = await getMyWishlistById(id, userId);

    if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

    sendSuccess(res, "Wishlist trouvée", { wishlist });
  }
);

export const getWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const id = req.params.id;
    const userId = req.user.userId;

    const wishlist = await getWishlistById(id, userId);

    if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

    sendSuccess(res, "Wishlist trouvée", { wishlist });
  }
);

export const getMyWishesFromWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const { wishlistId } = getWishesSchema.parse(req.query);

    const wishlist = await canAccessWishlist(userId, wishlistId);

    if (!wishlist)
      return next(new AuthError("Accès interdit à cette wishlist."));

    const wishes = await getMyWishesByWishlistId(wishlistId, userId);

    sendSuccess(res, "Souhaits trouvés", { wishes: wishes || [] }, 200);
  }
);

export const getWishesFromWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { wishlistId } = getWishesSchema.parse(req.query);
    const userId = req.user.userId;

    const wishes = await getWishesByWishlistId(wishlistId, userId);

    sendSuccess(res, "Souhaits trouvés", { wishes: wishes || [] }, 200);
  }
);

export const updateWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const id = req.params.id;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";
    const userId = req.user.userId;

    const { title, description, access, published, mode, participantIds } =
      updateWishlistSchema.parse(req.body);

    const file = req.file;

    const wishlist = await Wishlist.findByPk(id);

    if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

    if (wishlist.userId !== req.user.userId && !isAdmin) {
      return next(
        new AuthError("Vous n’êtes pas autorisé à modifier cette wishlist.")
      );
    }

    if (file) {
      let picture = wishlist.picture;
      if (picture) {
        const oldPath = path.join(__dirname, "../../public", picture);
        deleteFileIfExists(oldPath);
      }
    }

    const picture = req.file
      ? `/uploads/wishlistPictures/${req.file.filename}`
      : undefined;

    const updatedWishlist = await modifyWishlistById(
      id,
      userId,
      title,
      access,
      Number(published),
      mode,
      description,
      picture,
      participantIds
    );
    return sendSuccess(res, "Wishlist mise à jour", updatedWishlist);
  }
);

export const deleteWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";

    if (!id)
      return next(new AppError("wishlistId manquant dans la requête", 400));

    const wishlist = await Wishlist.findByPk(id);

    if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

    if (wishlist.userId === userId || isAdmin) {
      await deleteWishlistById(id, userId);
      return sendSuccess(res, "Wishlist supprimée", {}, 200);
    }

    await leaveWishlistAsCollaborator(id, userId);
    return sendSuccess(res, "Vous avez quitté la wishlist", {}, 200);
  }
);

export const createWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { title, wishlistId, description, price, link } =
      createWishSchema.parse(req.body);

    const wishlist = await canAccessWishlist(req.user.userId, wishlistId);

    if (!wishlist)
      return next(new AuthError("Accès interdit à cette wishlist."));

    const picture = req.file
      ? `/uploads/wishPictures/${req.file.filename}`
      : undefined;

    const wish = await addNewWishToWishlist(
      title,
      wishlistId,
      description,
      price,
      link,
      picture
    );

    return sendSuccess(res, "Wish créé", { wish });
  }
);

export const getMyWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const id = req.params.id;
    const userId = req.user.userId;

    const wish = await findMyWishById(id, userId);
    if (!wish) return next(new NotFoundError("Wish non trouvé"));

    sendSuccess(res, "Wish trouvé", { wish });
  }
);

export const getWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const id = req.params.id;
    const userId = req.user.userId;

    const wish = await findWishById(id, userId);
    if (!wish) return next(new NotFoundError("Wish non trouvé"));

    sendSuccess(res, "Wish trouvé", { wish });
  }
);

export const updateWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const id = req.params.id;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";
    const userId = req.user.userId;

    const { title, description, price, link } = updateWishSchema.parse(
      req.body
    );

    const file = req.file;

    const wish = await Wish.findByPk(id);
    if (!wish) return next(new NotFoundError("Wish non trouvé"));

    const wishlist = await canAccessWishlist(
      req.user.userId,
      wish.wishlistId,
      isAdmin
    );

    if (!wishlist)
      return next(new AuthError("Accès interdit à cette wishlist."));

    if (file) {
      let picture = wish.picture;

      if (picture) {
        const oldPath = path.join(__dirname, "../../public", picture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const picture = req.file
      ? `/uploads/wishPictures/${req.file.filename}`
      : undefined;

    const updatedWish = await modifyWishById(
      id,
      userId,
      title,
      link,
      Number(price),
      description,
      picture
    );
    return sendSuccess(res, "Wish mis à jour", updatedWish);
  }
);

export const deleteWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { id } = req.params;
    const userRole = req.user.role;
    const isAdmin = userRole === "admin";
    const userId = req.user.userId;

    if (!id) return next(new AppError("wishId manquant dans la requête", 400));

    const wish = await Wish.findByPk(id);
    if (!wish) return next(new NotFoundError("Wish non trouvé"));

    const wishlist = await canAccessWishlist(
      req.user.userId,
      wish.wishlistId,
      isAdmin
    );

    if (!wishlist)
      return next(new AuthError("Accès interdit à cette wishlist."));

    await deleteWishById(id, userId);
    return sendSuccess(res, "Souhait supprimé", {}, 200);
  }
);

export const scrapAndCreateWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { url, wishlistId } = req.body;
    const userId = req.user.userId;

    if (!url || !wishlistId) {
      return next(new ValidationError("Champs manquants."));
    }

    const wishlist = await canAccessWishlist(userId, wishlistId);
    if (!wishlist) {
      return next(new AuthError("Accès refusé à cette wishlist."));
    }

    const results = await findProductsByQuery(url, wishlistId);
    if (!results.length) {
      return next(new NotFoundError("Aucun résultat trouvé pour cette URL."));
    }

    const bestResult = results[0];

    const wish = await addNewWishToWishlist(
      bestResult.title,
      wishlistId,
      bestResult.snippet,
      bestResult.price ?? undefined,
      bestResult.link,
      bestResult.image ?? undefined
    );

    return sendSuccess(res, "Souhait créé automatiquement", { wish }, 201);
  }
);

export const searchWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { query } = searchWishlistSchema.parse(req.query);
    const userRole = req.user.role;

    const userId = req.user.userId;

    const searchTerm = query;

    if (typeof searchTerm !== "string") {
      return next(new AppError("Paramètre 'query' manquant ou invalide", 400));
    }

    const results = await searchWishlistByTitle(searchTerm, userId, userRole);

    return sendSuccess(res, "Résultats trouvés", { wishlists: results });
  }
);

export const getSubscriptionStatus = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const wishlistId = req.params.wishlistId;

    const isSubscribed = await Subscriber.findOne({
      where: { userId, wishlistId },
    });

    return sendSuccess(res, "Statut d'abonnement récupéré", {
      subscribed: !!isSubscribed,
    });
  }
);

export const subscribeToWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const { wishlistId } = subscribeSchema.parse(req.params);

    const result = await subscribeToWishlistService(userId, wishlistId);

    return sendSuccess(
      res,
      "Abonnement à la wishlist réussi",
      { collaborator: result },
      201
    );
  }
);

export const unsubscribeFromWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const { wishlistId } = subscribeSchema.parse(req.params);

    await unsubscribeFromWishlistService(userId, wishlistId);

    return sendSuccess(res, "Désabonnement effectué avec succès", {}, 200);
  }
);

export const removeSubscriber = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const ownerId = req.user.userId;
    const { wishlistId, subscriberId } = req.params;

    if (!wishlistId || !subscriberId) {
      throw new ValidationError("Paramètres manquants.");
    }

    await unsubscribeFromWishlistService(ownerId, wishlistId, subscriberId);

    return sendSuccess(res, "Abonné retiré avec succès.");
  }
);

export const deleteUserWishlists = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { userId } = req.body;

    if (!userId)
      return next(new ValidationError("L'ID utilisateur est requis."));

    await deleteWishlistsByUserId(userId);
    return sendSuccess(res, "Liste supprimée", {}, 200);
  }
);

export const reserveWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const wishId = req.params.id;

    if (!wishId) {
      return next(new ValidationError("ID du souhait manquant"));
    }

    const isAnonymous = req.body?.isAnonymous ?? true;

    const wish = await reserveWishService(wishId, userId, isAnonymous);

    return sendSuccess(res, "Souhait réservé", { wish }, 200);
  }
);

export const cancelReserveWish = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;
    const wishId = req.params.id;

    if (!wishId) {
      return next(new ValidationError("ID du souhait manquant"));
    }

    const wish = await cancelReservationService(wishId, userId);

    return sendSuccess(res, "Réservation annulée", { wish }, 200);
  }
);

export const getMyReservedWishes = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;

    if (!userId) {
      return next(new ValidationError("ID utilisateur manquant"));
    }

    const wishes = await getReservedWishesByUser(userId);

    return sendSuccess(res, "Souhaits réservés récupérés", { wishes });
  }
);
