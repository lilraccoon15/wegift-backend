import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserProfile from "./UserProfile";

class Friendship extends Model {
    public id!: string;
    public userId1!: string;
    public userId2!: string;
}

Friendship.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId1: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: UserProfile,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        userId2: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: UserProfile,
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        tableName: "friendships",
        timestamps: true,
    }
)

export default Friendship;