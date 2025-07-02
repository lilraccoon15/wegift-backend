import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Participants extends Model {
    public id!: string;
    public userId!: string;
    public exchangeId!: string;
    public invitedAt!: Date;
    public acceptedAt!: Date | null;
}

Participants.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        exchangeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        invitedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        acceptedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "participants",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["userId", "exchangeId"],
            },
        ],
    }
);

export default Participants;
