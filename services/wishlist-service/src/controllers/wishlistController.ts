import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import Wishlist from "../models/Wishlist";
import Wish from "../models/Wish";
import sendSuccess from "../utils/sendSuccess";
import { createNewWish, createWishlistService, deleteWishlistService, deleteWishService, updateWishlistService } from "../services/wishlistService";
import path from "path";
import fs from "fs";
import { AppError, NotFoundError } from "../errors/CustomErrors";

export const getUserWishlists = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const wishlists = await Wishlist.findAll({
            where: { userId },
            attributes: [
                "id",
                "userId",
                "title",
                "access",
                "picture",
                "description",
                "published",
            ],
        });

        sendSuccess(res, "Wishlist(s) trouvée(s)", { wishlists }, 200);
    }
);

export const createWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const { title, description, published, access } = req.body;

        const picture = req.file
            ? `/uploads/wishlistPictures/${req.file.filename}`
            : undefined;

        const wishlist = await createWishlistService(
            userId,
            title,
            published,
            access,
            description,
            picture
        );

        return sendSuccess(res, "Wishlist créée", wishlist);
    }
);

export const getUserWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const id = req.params.id;

        const wishlist = await Wishlist.findOne({
            where: { id },
            attributes: [
                "id",
                "userId",
                "title",
                "access",
                "picture",
                "description",
                "published",
            ],
        });

        sendSuccess(res, "Wishlist trouvée", { wishlist }, 200);
    }
);

export const getUserWishesFromWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const wishlistId = req.query.wishlistid;

        const wishes = await Wish.findAll({
            where: { wishlistId },
            attributes: ["id", "title"],
        });

        sendSuccess(res, "Souhaits trouvés", { wishes }, 200);
    }
);

export const updateWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const id = req.params.id;

        const { title, description, access, published } = req.body;

        const file = req.file;

        const wishlist = await Wishlist.findByPk(id);

        if (!wishlist) return next(new NotFoundError("Wishlist non trouvée"));

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

        const updatedWishlist = await updateWishlistService(
            id,
            title,
            access,
            Number(published),
            description,
            picture,
        );
        return sendSuccess(res, "Wishlist mise à jour", updatedWishlist);
    }
);

export const deleteWishlist = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
      const { id } = req.params;

      if (!id)
        return next(new AppError("wishlistId manquant dans la requête", 400));

      await deleteWishlistService(id);
      return sendSuccess(res, "Wishlist supprimée", {}, 200);
    }
);

export const createWish = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { title, wishlistId, description, price, link } = req.body;

        const picture = req.file
            ? `/uploads/wishPictures/${req.file.filename}`
            : undefined;

        const wish = await createNewWish(
            title, wishlistId, description, price, link, picture
        );

        return sendSuccess(res, "Wish créé", wish);
    }
);

export const getUserWish = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const id = req.params.id;

        const wish = await Wish.findOne({
            where: { id },
            attributes: [
                "id",
                "wishlistId",
                "title",
                "description",
                "price",
                "link",
                "picture"
            ],
        });

        sendSuccess(res, "Wish trouvé", { wish }, 200);
    }
);

export const updateWish = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const id = req.params.id;

        const { title, description, price, link } = req.body;

        const file = req.file;

        const wish = await Wish.findByPk(id);

        if (!wish) return next(new NotFoundError("Wish non trouvé"));

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

        const updatedWish = await updateWishlistService(
            id,
            title,
            link,
            Number(price),
            description,
            picture,
        );
        return sendSuccess(res, "Wish mis à jour", updatedWish);
    }
);

export const deleteWish = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
      const { id } = req.params;

      if (!id)
        return next(new AppError("wishId manquant dans la requête", 400));

      await deleteWishService(id);
      return sendSuccess(res, "Souhait supprimé", {}, 200);
    }
);