import Notification from "./Notification";
import NotificationType from "./NotificationTypes";

export default function setupAssociations() {
    Notification.belongsTo(NotificationType, {
        foreignKey: "notificationTypeId",
        as: "type",
    });

    NotificationType.hasMany(Notification, {
        foreignKey: "notificationTypeId",
        as: "notifications",
    });
}

export { Notification, NotificationType };
