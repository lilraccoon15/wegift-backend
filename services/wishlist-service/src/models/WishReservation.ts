import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Wish from "./Wish";

class WishReservation extends Model {
  public id!: string;
  public wishId!: string;
  public userId!: string;
  public isAnonymous!: boolean;

  public createdAt!: Date;
  public updatedAt!: Date;

  public wish?: Wish;
}

WishReservation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    wishId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "wish_reservations",
    timestamps: true,
  }
);

export default WishReservation;
