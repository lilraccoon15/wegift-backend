import { Router } from "express";
import { getUserNotifications, sendNotification } from "../controllers/notificationController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import verifyTokenMiddleware from "../middlewares/verifyTokenMiddleware";
const router = Router();

router.get("/get-notifications", verifyTokenMiddleware, ensureAuthenticated, getUserNotifications);
router.post("/notifications", verifyTokenMiddleware, ensureAuthenticated, sendNotification);

export default router;
