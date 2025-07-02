import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Exchange extends Model {
    public id!: string;
    public userId!: string;
    public title!: string;
    public picture!: string | null;
    public description!: string | null;
    public status!: string;
    public startDate!: Date;
    public endDate!: Date;
}

Exchange.init(
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "active", "finished"),
            allowNull: false,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "exchange",
        timestamps: true,
    }
);

export default Exchange;
