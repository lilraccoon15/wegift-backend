import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public birthDate!: Date;
  public email!: string;
  public password!: string;
  public acceptedTerms!: boolean;
  public newsletter!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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
    }   
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
