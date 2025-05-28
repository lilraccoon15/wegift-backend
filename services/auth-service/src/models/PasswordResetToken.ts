import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PasswordResetToken extends Model {}

PasswordResetToken.init(
    {
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
        }
    },
    {
        sequelize,
        tableName: 'password_reset_tokens',
        timestamps: false,
    }
);

export default PasswordResetToken;