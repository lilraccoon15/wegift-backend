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
