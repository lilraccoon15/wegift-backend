import { Router } from "express";

import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

import {
  getNotificationsForUser,
  markAllUserNotificationsAsRead,
} from "../controllers/notificationController";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

// === Notifications utilisateur ===
router.get("/notifications", ...requireAuth, getNotificationsForUser);
router.put("/mark-as-read", ...requireAuth, markAllUserNotificationsAsRead);

export default router;
