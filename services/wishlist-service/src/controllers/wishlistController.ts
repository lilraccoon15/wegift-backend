import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import Wishlist from "../models/Wishlist";
import Wish from "../models/Wish";
import sendSuccess from "../utils/sendSuccess";
import { createWishlistService, deleteWishlistService, updateWishlistService } from "../services/wishlistService";
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
      return sendSuccess(res, "Profil utilisateur supprimé", {}, 200);
    }
);
