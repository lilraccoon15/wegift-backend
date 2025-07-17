import { Router } from "express";
import {
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

export default router;
