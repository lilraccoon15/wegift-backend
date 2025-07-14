import { Router } from "express";

import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { upload } from "../middlewares/upload";

import {
    createWish,
    createWishlist,
    deleteWish,
    deleteWishlist,
    getMyWish,
    getWish,
    getMyWishlist,
    getWishlist,
    getMyWishlists,
    getWishlists,
    getMyWishesFromWishlist,
    getWishesFromWishlist,
    updateWish,
    updateWishlist,
    searchProduct,
    searchWishlist,
    subscribeToWishlist,
    unsubscribeFromWishlist,
} from "../controllers/wishlistController";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

// === Wishlists ===
router.get("/my-wishlists", ...requireAuth, getMyWishlists);
router.get("/wishlists/:userId", ...requireAuth, getWishlists);
router.post(
    "/create-wishlist",
    ...requireAuth,
    upload.single("picture"),
    createWishlist
);
router.get("/my-wishlist/:id", ...requireAuth, getMyWishlist);
router.get("/wishlist/:id", ...requireAuth, getWishlist);
router.put(
    "/update-wishlist/:id",
    ...requireAuth,
    upload.single("picture"),
    updateWishlist
);
router.delete("/delete-wishlist/:id", ...requireAuth, deleteWishlist);

// === Wishes ===
router.get("/my-wishes", ...requireAuth, getMyWishesFromWishlist);
router.get("/wishes", ...requireAuth, getWishesFromWishlist);
router.post(
    "/create-wish",
    ...requireAuth,
    upload.single("picture"),
    createWish
);
router.get("/my-wish/:id", ...requireAuth, getMyWish);
router.get("/wish/:id", ...requireAuth, getWish);
router.put(
    "/update-wish/:id",
    ...requireAuth,
    upload.single("picture"),
    updateWish
);
router.delete("/delete-wish/:id", ...requireAuth, deleteWish);

// === Recherche ===
router.get("/search-product", ...requireAuth, searchProduct);
router.get("/search", ...requireAuth, searchWishlist);

// === Souscriptions aux wishlists ===
router.post("/:wishlistId/subscribe", ...requireAuth, subscribeToWishlist);
router.delete(
    "/:wishlistId/unsubscribe",
    ...requireAuth,
    unsubscribeFromWishlist
);

export default router;
