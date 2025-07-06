import { Router } from "express";
import {
    getNotificationsForUser,
    sendUserNotification,
    updateNotification,
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
    updateNotification
);

export default router;
