import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Notification extends Model {
    public id!: string;
    public userId!: string;
    public notificationTypeId!: string;
    public data!: object;
    public read!: boolean;
}

Notification.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        notificationTypeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "notifications_types",
                key: "id",
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: "notifications",
        timestamps: true,
    }
);

export default Notification;
