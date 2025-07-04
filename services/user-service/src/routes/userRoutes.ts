import { Router } from "express";
import {
    checkFriendshipStatus,
    sendFriendRequest,
    createUserProfile,
    deleteUserProfile,
    getCurrentUserBasicInfo,
    getFriendshipStatusBetweenUsers,
    getFriendsListForUser,
    getUserProfileById,
    getUserProfile,
    updateUserProfile,
    searchUser,
} from "../controllers/userController";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/userSchema";
import { upload } from "../middlewares/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router = Router();

router.get("/me", verifyTokenMiddleware, ensureAuthenticated, getUserProfile);
router.post(
    "/profile",
    verifyTokenMiddleware,
    ensureAuthenticated,
    validateBody(createProfileSchema),
    createUserProfile
);
router.get(
    "/get-user",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getCurrentUserBasicInfo
);
router.put(
    "/update-profile",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    updateUserProfile
);
router.delete(
    "/delete-profile",
    verifyTokenMiddleware,
    ensureAuthenticated,
    upload.single("picture"),
    deleteUserProfile
);
router.get(
    "/profile/:id",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getUserProfileById
);
router.get(
    "/are-friends",
    verifyTokenMiddleware,
    ensureAuthenticated,
    checkFriendshipStatus
);
router.get(
    "/friendship-status",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getFriendshipStatusBetweenUsers
);
router.post(
    "/ask-friend",
    verifyTokenMiddleware,
    ensureAuthenticated,
    sendFriendRequest
);
router.get(
    "/get-friends",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getFriendsListForUser
);

router.get("/search", verifyTokenMiddleware, ensureAuthenticated, searchUser);

export default router;
