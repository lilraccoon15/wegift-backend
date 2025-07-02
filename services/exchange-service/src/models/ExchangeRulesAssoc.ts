import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class ExchangeRulesAssoc extends Model {
    public id!: string;
    public exchangeId!: string;
    public ruleId!: string;
}

ExchangeRulesAssoc.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        exchangeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        ruleId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "exchange_rules_assoc",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["exchangeId", "ruleId"],
            },
        ],
    }
);

export default ExchangeRulesAssoc;
