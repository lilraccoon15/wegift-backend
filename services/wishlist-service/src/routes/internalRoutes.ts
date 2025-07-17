import { Router } from "express";

import { internalAuthMiddleware } from "../middlewares/internalAuthMiddleware";
import { upload } from "../middlewares/upload";
import { deleteUserWishlists } from "../controllers/wishlistController";

const router = Router();

router.delete(
    "/delete-wishlists",
    internalAuthMiddleware,
    upload.single("picture"),
    deleteUserWishlists
);

export default router;
