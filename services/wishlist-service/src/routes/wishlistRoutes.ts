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
  searchWishlist,
  subscribeToWishlist,
  unsubscribeFromWishlist,
  scrapAndCreateWish,
  getSubscriptionStatus,
  reserveWish,
  cancelReserveWish,
  getMyReservedWishes,
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
router.post("/scrap-wish", ...requireAuth, scrapAndCreateWish);
router.post("/reserve/:id", ...requireAuth, reserveWish);
router.get("/my-wish/:id", ...requireAuth, getMyWish);
router.get("/wish/:id", ...requireAuth, getWish);
router.get("/my-reserved-wishes", ...requireAuth, getMyReservedWishes);
router.put(
  "/update-wish/:id",
  ...requireAuth,
  upload.single("picture"),
  updateWish
);
router.delete("/delete-wish/:id", ...requireAuth, deleteWish);
router.delete("/cancel-reserve/:id", ...requireAuth, cancelReserveWish);

// === Recherche ===
router.get("/search", ...requireAuth, searchWishlist);

// === Souscriptions aux wishlists ===
router.get(
  "/subscription-status/:wishlistId",
  ...requireAuth,
  getSubscriptionStatus
);
router.post("/subscribe/:wishlistId", ...requireAuth, subscribeToWishlist);
router.delete(
  "/unsubscribe/:wishlistId",
  ...requireAuth,
  unsubscribeFromWishlist
);

export default router;
