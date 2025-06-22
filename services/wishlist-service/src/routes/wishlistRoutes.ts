import { Router } from "express";
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { createWish, createWishlist, deleteWish, deleteWishlist, getUserWish, getUserWishesFromWishlist, getUserWishlist, getUserWishlists, searchProduct, updateWish, updateWishlist } from "../controllers/wishlistController";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/my-wishlists", verifyTokenMiddleware, ensureAuthenticated, getUserWishlists);
router.post("/create-wishlist", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), createWishlist);
router.get("/my-wishlist/:id", verifyTokenMiddleware, ensureAuthenticated, getUserWishlist);
router.get("/wishes", verifyTokenMiddleware, ensureAuthenticated, getUserWishesFromWishlist);
router.put("/update-wishlist/:id", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), updateWishlist);
router.delete("/delete-wishlist/:id", verifyTokenMiddleware, ensureAuthenticated, deleteWishlist);
router.post("/create-wish", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), createWish);
router.get("/my-wish/:id", verifyTokenMiddleware, ensureAuthenticated, getUserWish);
router.put("/update-wish/:id", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), updateWish);
router.delete("/delete-wish/:id", verifyTokenMiddleware, ensureAuthenticated, deleteWish);
router.get("/search-product", verifyTokenMiddleware, ensureAuthenticated, searchProduct);


export default router;
