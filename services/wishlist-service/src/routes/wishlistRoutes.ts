import { Router } from "express";
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { createWishlist, deleteWishlist, getUserWishesFromWishlist, getUserWishlist, getUserWishlists, updateWishlist } from "../controllers/wishlistController";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/my-wishlists", verifyTokenMiddleware, ensureAuthenticated, getUserWishlists);
router.post("/create-wishlist", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), createWishlist);
router.get("/my-wishlist/:id", verifyTokenMiddleware, ensureAuthenticated, getUserWishlist);
router.get("/wishes", verifyTokenMiddleware, ensureAuthenticated, getUserWishesFromWishlist);
router.put("/update-wishlist/:id", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), updateWishlist);
router.delete("/delete-wishlist/:id", verifyTokenMiddleware, ensureAuthenticated, deleteWishlist);

export default router;
