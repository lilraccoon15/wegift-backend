import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Assigned extends Model {
    public id!: string;
    public userId!: string;
    public assignedUserId!: string;
    public exchangeId!: string | null;
}

Assigned.init(
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
        assignedUserId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        exchangeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "assigned",
        timestamps: false,
    }
);

export default Assigned;
