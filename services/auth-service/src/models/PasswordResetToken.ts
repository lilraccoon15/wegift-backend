import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

interface PasswordResetTokenAttributes {
    id?: number;
    userId: string;
    token: string;
    expiresAt: Date;
}

class PasswordResetToken
    extends Model<PasswordResetTokenAttributes>
    implements PasswordResetTokenAttributes
{
    public id!: number;
    public userId!: string;
    public token!: string;
    public expiresAt!: Date;
}

PasswordResetToken.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "password_reset_tokens",
        timestamps: false,
    }
);

export default PasswordResetToken;
