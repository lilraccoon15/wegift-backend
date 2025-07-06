import { Router } from "express";
import {
    sendFriendRequest,
    createUserProfile,
    deleteUserProfile,
    getMyFriendList,
    getUserProfileById,
    getMyProfile,
    updateUserProfile,
    searchUser,
    getFriendshipStatus,
    deleteFriend,
    respondToFriendRequest,
} from "../controllers/userController";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { validateBody } from "../middlewares/validateBody";
import { createProfileSchema } from "../schemas/userSchema";
import { upload } from "../middlewares/upload";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router = Router();

router.get(
    "/my-profile",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyProfile
);
router.post(
    "/create-profile",
    verifyTokenMiddleware,
    ensureAuthenticated,
    validateBody(createProfileSchema),
    createUserProfile
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
    "/friendship-status",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getFriendshipStatus
);
router.post(
    "/ask-friend",
    verifyTokenMiddleware,
    ensureAuthenticated,
    sendFriendRequest
);
router.get(
    "/my-friends",
    verifyTokenMiddleware,
    ensureAuthenticated,
    getMyFriendList
);
// router.get(
//     "/:userId/friends",
//     verifyTokenMiddleware,
//     ensureAuthenticated,
//     getFriendList
// );

router.delete(
    "/delete-friend/:friendId",
    verifyTokenMiddleware,
    ensureAuthenticated,
    deleteFriend
);

router.patch(
    "/friends/:requesterId/respond",
    verifyTokenMiddleware,
    ensureAuthenticated,
    respondToFriendRequest
);

router.get("/search", verifyTokenMiddleware, ensureAuthenticated, searchUser);

export default router;
