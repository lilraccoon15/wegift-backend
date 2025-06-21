import Notification from "../models/Notification";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";

export const getUserNotifications = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const userId = req.user.id;

        const notifications = await Notification.findAll({
            where: { recipientId: userId },
            attributes: [
                "id",
                "senderId",
                "recipientId",
                "type",
                "data",
                "read",
                "createdAt",
            ],
        });

        sendSuccess(res, "Notification(s) trouvée(s)", { notifications }, 200);
    }
);

export const sendNotification = asyncHandler(
    async (req: AuthenticatedRequest, res, next) => {
        const { recipientId, senderId, type, data, read } = req.body;

        const notification = await Notification.create({
            recipientId,
            senderId,
            type,
            data,
            read: read ?? false,
        });

        return sendSuccess(res, "Notification créée", notification);
    }
);
