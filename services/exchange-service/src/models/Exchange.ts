import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Rules from "./Rules";
import Participants from "./Participants";

class Exchange extends Model {
  public id!: string;
  public userId!: string;
  public title!: string;
  public picture!: string | null;
  public description!: string | null;
  public startDate!: Date;
  public endDate!: Date;
  public budget!: Number;

  public setRules!: (rules: string[] | Rules[]) => Promise<void>;

  public participants?: Participants[];
  public rules?: Rules[];
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "exchange",
    timestamps: true,
  }
);

export default Exchange;
