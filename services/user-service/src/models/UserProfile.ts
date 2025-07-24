import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class UserProfile extends Model {
  public id!: string;
  public userId!: string;
  public pseudo!: string;
  public birthDate!: Date;
  public picture!: string | null;
  public description!: string | null;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    pseudo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
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
  },
  {
    sequelize,
    tableName: "users_profiles",
    timestamps: true,
  }
);

export default UserProfile;
