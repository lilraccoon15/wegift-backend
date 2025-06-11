import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Wish extends Model {
  public id!: string;
  public wishlistId!: string;
  public title!: string;
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
  },
  {
    sequelize,
    tableName: "wishes",
    timestamps: true,
  }
);

export default Wish;
