import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";
import {
  findNotificationsByUserId,
  readNotificationsByUserId,
  sendNotificationToUser,
} from "../services/notificationServices";
import { sendNotificationSchema } from "../schemas/notificationSchema";

export const getNotificationsForUser = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;

    const notifications = await findNotificationsByUserId(userId);

    sendSuccess(
      res,
      "Notification(s) trouvée(s)",
      { notifications: notifications ?? [] },
      200
    );
  }
);

export const sendUserNotification = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { userId, type, data, read } = sendNotificationSchema.parse(req.body);

    const notification = await sendNotificationToUser(userId, type, data, read);

    return sendSuccess(res, "Notification créée", { notification }, 201);
  }
);

export const markAllUserNotificationsAsRead = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;

    const notifications = await readNotificationsByUserId(userId);

    sendSuccess(
      res,
      "Notification(s) marquée(s) comme lue(s)",
      { notifications },
      200
    );
  }
);
