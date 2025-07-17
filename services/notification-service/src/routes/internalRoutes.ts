import { Router } from "express";
import { sendUserNotification } from "src/controllers/notificationController";
import { internalAuthMiddleware } from "src/middlewares/internalAuthMiddleware";

const router = Router();

router.post("/send-notification", internalAuthMiddleware, sendUserNotification);

export default router;
