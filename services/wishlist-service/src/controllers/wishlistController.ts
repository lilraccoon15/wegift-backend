import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import Wishlist from "../models/Wishlist";
import sendSuccess from "../utils/sendSuccess";
import { createWishlistService } from "../services/wishlistService";

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
            ? `/uploads/profilePictures/${req.file.filename}`
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

export const getUserWishlist = asyncHandler(async (req:AuthenticatedRequest, res, next) => {

});