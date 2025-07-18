import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class User extends Model {
    public id!: string;
    public role!: "user" | "admin";
    public email!: string;
    public password!: string;
    public acceptedTerms!: boolean;
    public newsletter!: boolean;
    public isActive!: boolean;
    public twoFactorEnabled!: boolean;
    public twoFactorSecret!: string | null;
    public googleId!: string | null;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        role: {
            type: DataTypes.ENUM("user", "admin"),
            allowNull: false,
            defaultValue: "user",
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        acceptedTerms: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        newsletter: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        twoFactorEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        twoFactorSecret: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "users",
        timestamps: false,
    }
);

export default User;
