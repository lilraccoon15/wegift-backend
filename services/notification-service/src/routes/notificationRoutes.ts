import { Router } from "express";
import {
  getNotificationsForUser,
  markAllUserNotificationsAsRead,
  sendUserNotification,
} from "../controllers/notificationController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
const router = Router();

router.get(
  "/notifications",
  verifyTokenMiddleware,
  ensureAuthenticated,
  getNotificationsForUser
);
router.post(
  "/send-notification",
  verifyTokenMiddleware,
  ensureAuthenticated,
  sendUserNotification
);
router.put(
  "/mark-as-read",
  verifyTokenMiddleware,
  ensureAuthenticated,
  markAllUserNotificationsAsRead
);

export default router;
