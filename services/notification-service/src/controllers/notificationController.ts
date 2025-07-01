import Notification from "../models/Notification";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";
import NotificationType from "../models/NotificationTypes";
import { AppError } from "../errors/CustomErrors";
import { findNotificationsByUserId } from "../services/notificationServices";

export const getNotificationsForUser = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.query.userId as string;

        if (!userId) {
            return next(new AppError("userId  manquant", 400));
        }

        const notifications = await findNotificationsByUserId(userId);

        sendSuccess(res, "Notification(s) trouvée(s)", { notifications }, 200);
    }
);

export const sendUserNotification = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { userId, type, data, read } = req.body;

        const notifType = await NotificationType.findOne({ where: { type } });

        if (!notifType)
            throw new Error(`Type de notification inconnu: ${type}`);

        const notification = await Notification.create({
            userId,
            notificationTypeId: notifType.id,
            data,
            read: read ?? false,
        });

        return sendSuccess(res, "Notification créée", notification);
    }
);
