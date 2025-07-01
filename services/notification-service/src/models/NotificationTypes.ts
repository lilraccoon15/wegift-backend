import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class NotificationType extends Model {
    public id!: string;
    public type!: string;
    public text!: string;
}

NotificationType.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("friendship", "wishlist", "exchange"),
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "notifications_types",
        timestamps: false,
    }
);

export default NotificationType;
