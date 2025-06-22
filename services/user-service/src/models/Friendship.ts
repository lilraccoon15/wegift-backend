import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import UserProfile from "./UserProfile";

class Friendship extends Model {
    public id!: string;
    public requesterId!: string;
    public addresseeId!: string;
    public status!: "pending" | "accepted";
    public requester?: UserProfile;
    public addressee?: UserProfile;
}

Friendship.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        requesterId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: UserProfile,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        addresseeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: UserProfile,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        status: {
            type: DataTypes.ENUM("pending", "accepted"),
            allowNull: false,
            defaultValue: "pending",
        },
    },
    {
        sequelize,
        tableName: "friendships",
        timestamps: true,
    }
);

export default Friendship;
