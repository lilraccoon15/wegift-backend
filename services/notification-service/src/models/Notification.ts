import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Notification extends Model {
    public id!: string;
    public recipientId!: string;
    public senderId!: string | null;
    public type!:
        | "friend_request"
        | "wishlist_update"
        | "exchange_update"
        | "other";
    public data!: object;
    public read!: boolean;
    public createdAt!: Date;
}

Notification.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        recipientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        type: {
            type: DataTypes.ENUM(
                "friend_request",
                "wishlist_update",
                "exchange_update",
                "other"
            ),
            allowNull: false,
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "notifications",
        timestamps: false,
    }
);

export default Notification;
