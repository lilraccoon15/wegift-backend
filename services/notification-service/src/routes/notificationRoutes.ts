import { Router } from "express";

import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

import {
    getNotificationsForUser,
    markAllUserNotificationsAsRead,
    sendUserNotification,
} from "../controllers/notificationController";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

// === Notifications utilisateur ===
router.get("/notifications", ...requireAuth, getNotificationsForUser);
router.post("/send-notification", ...requireAuth, sendUserNotification);
router.put("/mark-as-read", ...requireAuth, markAllUserNotificationsAsRead);

export default router;
