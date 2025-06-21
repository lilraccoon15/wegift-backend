import { Router } from "express";
import { areFriends, askFriendship, createProfile, deleteProfile, getCurrentUser, getFriendshipStatus, getUser, me, updateProfile } from "../controllers/userController";
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/userSchema";
import { upload } from "../middlewares/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router = Router();

router.get("/me", verifyTokenMiddleware, ensureAuthenticated, me);
router.post("/profile", verifyTokenMiddleware, ensureAuthenticated, validateBody(createProfileSchema), createProfile);
router.get("/get-user", verifyTokenMiddleware, ensureAuthenticated, getCurrentUser);
router.put("/update-profile", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), updateProfile);
router.delete("/delete-profile", verifyTokenMiddleware, ensureAuthenticated, upload.single("picture"), deleteProfile);
router.get("/profile/:id", verifyTokenMiddleware, ensureAuthenticated, getUser);
router.get("/are-friends", verifyTokenMiddleware, ensureAuthenticated, areFriends);
router.get("/friendship-status", verifyTokenMiddleware, ensureAuthenticated, getFriendshipStatus);
router.post("/ask-friend", verifyTokenMiddleware, ensureAuthenticated, askFriendship);

export default router;
