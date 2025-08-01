import { Router } from "express";

import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { upload } from "../middlewares/upload";

import {
  getMyProfile,
  updateUserProfile,
  getUserProfileById,
  checkPseudoAvailability,
  searchUser,
  getFriendshipStatus,
  sendFriendRequest,
  respondToFriendRequest,
  getMyFriendList,
  getFriendList,
  deleteFriend,
  getMyPendingFriendList,
  deleteFriendRequest,
} from "../controllers/userController";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

router.get("/my-profile", ...requireAuth, getMyProfile);
router.put(
  "/update-profile",
  ...requireAuth,
  upload.single("picture"),
  updateUserProfile
);
// todo : route pour update le profil en tant qu'admin

router.get("/profile/:userId", ...requireAuth, getUserProfileById);
router.get("/check-pseudo", checkPseudoAvailability);
router.get("/search", ...requireAuth, searchUser);

router.get("/friendship-status", ...requireAuth, getFriendshipStatus);
router.post("/ask-friend", ...requireAuth, sendFriendRequest);
router.patch(
  "/friends/:requesterId/respond",
  ...requireAuth,
  respondToFriendRequest
);
router.get("/my-friends", ...requireAuth, getMyFriendList);
router.get("/my-pending-friends", ...requireAuth, getMyPendingFriendList);
router.get("/friends/:userId", ...requireAuth, getFriendList);
router.delete("/delete-friend/:friendId", ...requireAuth, deleteFriend);
router.delete("/friendship/:addresseeId", ...requireAuth, deleteFriendRequest);

export default router;
