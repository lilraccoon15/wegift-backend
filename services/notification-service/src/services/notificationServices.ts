import { NotFoundError } from "../errors/CustomErrors";
import { Notification, NotificationType } from "../models/setupAssociations";

export async function findNotificationsByUserId(userId: string) {
    return Notification.findAll({
        where: { userId },
        attributes: [
            "id",
            "userId",
            "notificationTypeId",
            "data",
            "read",
            "createdAt",
            "updatedAt",
        ],
        include: [
            {
                model: NotificationType,
                as: "type",
                attributes: ["type", "text"],
            },
        ],
    });
}

export async function readNotificationsByUserId(userId: string) {
    const notifications = await Notification.findAll({ where: { userId } });

    if (notifications.length === 0)
        throw new NotFoundError("Notifications non trouvées");

    await Notification.update(
        { read: true },
        {
            where: { userId, read: false },
        }
    );
}
