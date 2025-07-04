import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Collaborators extends Model {
    public id!: string;
    public userId!: string;
    public wishlistId!: string;
}

Collaborators.init(
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
        wishlistId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "collaborators",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["userId", "wishlistId"],
            },
        ],
    }
);

export default Collaborators;
