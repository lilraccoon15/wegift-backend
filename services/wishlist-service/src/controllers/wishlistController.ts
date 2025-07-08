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
    getWishlistById,
    getWishesByWishlistId,
    findWishById,
    getAllMyWishlists,
    searchWishlistByTitle,
    leaveWishlistAsCollaborator,
    subscribeToWishlistService,
    unsubscribeFromWishlistService,
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
import Collaborators from "../models/Collaborators";
import { Op } from "sequelize";

export const getMyWishlists = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const wishlists = await getAllMyWishlists(userId);

        sendSuccess(res, "Wishlists trouvées", { wishlists });
    }
);

export const getWishlists = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.params.userId;

        const wishlists = await getAllUserWishlists(userId);

        sendSuccess(res, "Wishlists trouvées", { wishlists });
    }
);

export const createWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

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
        const userId = req.user.id;
        const id = req.params.id;

        const wishlist = await getWishlistById(id, userId);

        if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

        sendSuccess(res, "Wishlist trouvée", { wishlist });
    }
);

export const getMyWishesFromWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;
        const { wishlistId } = getWishesSchema.parse(req.query);

        const wishlist = await Wishlist.findOne({
            where: {
                id: wishlistId,
                [Op.or]: [
                    { userId: req.user.id },
                    { "$collaborators.userId$": req.user.id },
                ],
            },
            include: [
                { model: Collaborators, as: "collaborators", attributes: [] },
            ],
        });

        if (!wishlist) {
            return next(
                new AuthError("Vous n'avez pas accès à cette wishlist.")
            );
        }

        const wishes = await getWishesByWishlistId(wishlistId, userId);

        sendSuccess(res, "Souhaits trouvés", { wishes: wishes || [] }, 200);
    }
);

export const updateWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const id = req.params.id;

        const { title, description, access, published, mode, participantIds } =
            updateWishlistSchema.parse(req.body);

        const file = req.file;

        const wishlist = await Wishlist.findByPk(id);

        if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

        if (wishlist.userId !== req.user.id) {
            return next(
                new AuthError(
                    "Vous n’êtes pas autorisé à modifier cette wishlist."
                )
            );
        }

        if (file) {
            let picture = wishlist.picture;

            if (picture) {
                const oldPath = path.join(__dirname, "../../public", picture);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        const picture = req.file
            ? `/uploads/wishlistPictures/${req.file.filename}`
            : undefined;

        const updatedWishlist = await modifyWishlistById(
            id,
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
        const userId = req.user.id;

        if (!id)
            return next(
                new AppError("wishlistId manquant dans la requête", 400)
            );

        const wishlist = await Wishlist.findByPk(id);

        if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

        if (wishlist.userId === userId) {
            await deleteWishlistById(id);
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

        const wishlist = await Wishlist.findOne({
            where: {
                id: wishlistId,
                [Op.or]: [
                    { userId: req.user.id },
                    { "$collaborators.userId$": req.user.id },
                ],
            },
            include: [
                { model: Collaborators, as: "collaborators", attributes: [] },
            ],
        });

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
        const userId = req.user.id;

        const wish = await Wish.findByPk(id);
        if (!wish) return next(new NotFoundError("Wish non trouvé"));

        const wishlist = await Wishlist.findOne({
            where: {
                id: wish.wishlistId,
                [Op.or]: [
                    { userId: req.user.id },
                    { "$collaborators.userId$": req.user.id },
                ],
            },
            include: [
                { model: Collaborators, as: "collaborators", attributes: [] },
            ],
        });

        if (!wishlist)
            return next(
                new AuthError(
                    "Vous n'avez pas le droit de consulter ce souhait."
                )
            );

        sendSuccess(res, "Wish trouvé", { wish });
    }
);

export const updateWish = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const id = req.params.id;

        const { title, description, price, link } = updateWishSchema.parse(
            req.body
        );

        const file = req.file;

        const wish = await Wish.findByPk(id);
        if (!wish) return next(new NotFoundError("Wish non trouvé"));

        const wishlist = await Wishlist.findOne({
            where: {
                id: wish.wishlistId,
                [Op.or]: [
                    { userId: req.user.id },
                    { "$collaborators.userId$": req.user.id },
                ],
            },
            include: [
                { model: Collaborators, as: "collaborators", attributes: [] },
            ],
        });

        if (!wishlist)
            return next(
                new AuthError(
                    "Vous n'avez pas le droit de modifier ce souhait."
                )
            );

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

        if (!id)
            return next(new AppError("wishId manquant dans la requête", 400));

        const wish = await Wish.findByPk(id);
        if (!wish) return next(new NotFoundError("Wish non trouvé"));

        const wishlist = await Wishlist.findOne({
            where: {
                id: wish.wishlistId,
                [Op.or]: [
                    { userId: req.user.id },
                    { "$collaborators.userId$": req.user.id },
                ],
            },
            include: [
                { model: Collaborators, as: "collaborators", attributes: [] },
            ],
        });

        if (!wishlist)
            return next(
                new AuthError(
                    "Vous n'avez pas le droit de supprimer ce souhait."
                )
            );

        await deleteWishById(id);
        return sendSuccess(res, "Souhait supprimé", {}, 200);
    }
);

export const searchProduct = asyncHandler(async (req, res, next) => {
    const query = req.query.q as string;

    if (!query) return next(new AppError("Paramètre 'q' manquant", 400));

    const results = await findProductsByQuery(query);

    return sendSuccess(res, "Résultats de recherche", { results }, 200);
});

export const searchWishlist = asyncHandler(async (req, res, next) => {
    const { query } = searchWishlistSchema.parse(req.query);

    const searchTerm = query;

    if (typeof searchTerm !== "string") {
        return next(
            new AppError("Paramètre 'query' manquant ou invalide", 400)
        );
    }

    const results = await searchWishlistByTitle(searchTerm);

    return sendSuccess(res, "Résultats trouvés", { wishlists: results });
});

export const subscribeToWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;
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
        const userId = req.user.id;
        const { wishlistId } = subscribeSchema.parse(req.params);

        await unsubscribeFromWishlistService(userId, wishlistId);

        return sendSuccess(res, "Désabonnement effectué avec succès", {}, 200);
    }
);
