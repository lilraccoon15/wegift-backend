import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Subscriber extends Model {
  public id!: string;
  public userId!: string;
  public wishlistId!: string;
}

Subscriber.init(
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
    wishlistId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Subscriber",
    tableName: "subscribers",
    timestamps: true,
  }
);

export default Subscriber;
