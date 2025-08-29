import { Router } from "express";
import {
  deleteSpecificNotification,
  deleteUserNotifications,
  sendUserNotification,
} from "../controllers/notificationController";
import { internalAuthMiddleware } from "../middlewares/internalAuthMiddleware";

const router = Router();

router.post("/send-notification", internalAuthMiddleware, sendUserNotification);
router.delete(
  "/delete-notifications",
  internalAuthMiddleware,
  deleteUserNotifications
);

router.delete(
  "/delete-notification",
  internalAuthMiddleware,
  deleteSpecificNotification
);

export default router;
