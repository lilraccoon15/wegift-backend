import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Wishlist from "./Wishlist";

class Wish extends Model {
    public id!: string;
    public wishlistId!: string;
    public title!: string;
    public description!: string | null;
    public picture!: string | null;
    public link!: string | null;
    public price!: number | null;
    public status!: "available" | "reserved";

    public wishlist?: Wishlist;
}

Wish.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        wishlistId: {
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
        link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("available", "reserved"),
            allowNull: false,
            defaultValue: "available",
        },
    },
    {
        sequelize,
        tableName: "wishes",
        timestamps: true,
    }
);

export default Wish;
