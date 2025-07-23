import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import sendSuccess from "../utils/sendSuccess";
import {
  deleteNotificationsByUserId,
  findNotificationsByUserId,
  readNotificationsByUserId,
  sendNotificationToUser,
} from "../services/notificationServices";
import { sendNotificationSchema } from "../schemas/notificationSchema";
import { ValidationError } from "../errors/CustomErrors";

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

export const deleteUserNotifications = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.userId;

    if (!userId)
      return next(new ValidationError("L'ID utilisateur est requis."));

    await deleteNotificationsByUserId(userId);
    return sendSuccess(res, "Notifications supprimées", {}, 200);
  }
);
