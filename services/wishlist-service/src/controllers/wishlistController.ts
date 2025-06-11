import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import Wishlist from "../models/Wishlist";
import Wish from "../models/Wish";
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

export const getUserWishlist = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const wishlistId = req.params.id;

    const wishlist = await Wishlist.findOne({
      where: { wishlistId },
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
      attributes: [
        "id",
        "title"
      ],
    });

    sendSuccess(res, "Souhaits trouvés", { wishes }, 200);
  }
);
