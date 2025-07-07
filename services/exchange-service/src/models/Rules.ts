import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Rules extends Model {
    public id!: string;
    public code!: string;
    public title!: string;
    public description!: string;
}

Rules.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "rules",
        timestamps: false,
    }
);

export default Rules;
