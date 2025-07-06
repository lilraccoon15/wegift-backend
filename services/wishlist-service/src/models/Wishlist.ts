import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Collaborators from "./Collaborators";

class Wishlist extends Model {
    public id!: string;
    public userId!: string;
    public title!: string;
    public access!: string;
    public picture!: string | null;
    public description!: string | null;
    public published!: number;
    public mode!: "individual" | "collaborative";
    public collaborators?: Collaborators[];
}

Wishlist.init(
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
        access: {
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
        published: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mode: {
            type: DataTypes.ENUM("individual", "collaborative"),
            allowNull: false,
            defaultValue: "individual",
        },
    },
    {
        sequelize,
        tableName: "wishlists",
        timestamps: true,
    }
);

export default Wishlist;
