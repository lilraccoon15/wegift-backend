import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface SessionAttrs {
  id: string;
  userId: string;
  refreshHash: string;
  ua: string | null;
  ip: string | null;
  remember: boolean;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
}

type SessionCreation = Optional<
  SessionAttrs,
  "id" | "ua" | "ip" | "remember" | "createdAt" | "lastUsedAt" | "revokedAt"
>;

export class Session
  extends Model<SessionAttrs, SessionCreation>
  implements SessionAttrs
{
  declare id: string;
  declare userId: string;
  declare refreshHash: string;
  declare ua: string | null;
  declare ip: string | null;
  declare remember: boolean;
  declare createdAt: Date;
  declare lastUsedAt: Date;
  declare expiresAt: Date;
  declare revokedAt: Date | null;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    refreshHash: { type: DataTypes.STRING, allowNull: false },
    ua: { type: DataTypes.STRING, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    remember: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastUsedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revokedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: "sessions",
    updatedAt: false,
  }
);
