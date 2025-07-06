import { Router } from "express";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import {
    createWish,
    createWishlist,
    deleteWish,
    deleteWishlist,
    getMyWish,
    getMyWishlist,
    getMyWishlists,
    searchProduct,
    searchWishlist,
    updateWish,
    updateWishlist,
    getMyWishesFromWishlist,
    getWishlists,
    subscribeToWishlist,
    unsubscribeFromWishlist,
} from "../controllers/wishlistController";
import { upload } from "../middlewares/upload";

const router = Router();

router.get(
    "/my-wishlists",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyWishlists
);
router.get(
    "/:userId/wishlists",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getWishlists
);
router.post(
    "/create-wishlist",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    createWishlist
);
router.get(
    "/my-wishlist/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyWishlist
);
// router.get(
//     "/wishlist/:id",
//     verifyTokenMiddleware,
//     ensureAuthenticated,
//     getWishlist
// );
router.get(
    "/my-wishes",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyWishesFromWishlist
);
// router.get(
//     "/:userId/wishes",
//     verifyTokenMiddleware,
//     ensureAuthenticated,
//     getUserWishesFromWishlist
// );
router.put(
    "/update-wishlist/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    updateWishlist
);
router.delete(
    "/delete-wishlist/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    deleteWishlist
);
router.post(
    "/create-wish",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    createWish
);
router.get(
    "/my-wish/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyWish
);
// router.get(
//     "/wish/:id",
//     verifyTokenMiddleware,
//     ensureAuthenticated,
//     getWish
// );
router.put(
    "/update-wish/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    updateWish
);
router.delete(
    "/delete-wish/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    deleteWish
);
router.get(
    "/search-product",
    verifyTokenMiddleware,
    ensureAuthenticated,
    searchProduct
);

router.get(
    "/search",
    verifyTokenMiddleware,
    ensureAuthenticated,
    searchWishlist
);

router.post(
    "/:wishlistId/subscribe",
    verifyTokenMiddleware,
    ensureAuthenticated,
    subscribeToWishlist
);

router.delete(
    "/:wishlistId/unsubscribe",
    verifyTokenMiddleware,
    ensureAuthenticated,
    unsubscribeFromWishlist
);

export default router;
