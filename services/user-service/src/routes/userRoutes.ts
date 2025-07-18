import { Router } from "express";

import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { upload } from "../middlewares/upload";

import {
  getMyProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfileById,
  checkPseudoAvailability,
  searchUser,
  getFriendshipStatus,
  sendFriendRequest,
  respondToFriendRequest,
  getMyFriendList,
  getFriendList,
  deleteFriend,
  updateProfileVisibility,
  getMyPendingFriendList,
} from "../controllers/userController";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

// === Profil utilisateur ===
router.get("/my-profile", ...requireAuth, getMyProfile);
router.put(
  "/update-profile",
  ...requireAuth,
  upload.single("picture"),
  updateUserProfile
);
router.patch("/update-visibility", ...requireAuth, updateProfileVisibility);

router.get("/profile/:userId", ...requireAuth, getUserProfileById);
router.get("/check-pseudo", checkPseudoAvailability);
router.get("/search", ...requireAuth, searchUser);

// === Amitié ===
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

export default router;
