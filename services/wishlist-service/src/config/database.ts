import "../config/loadEnv";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: false,
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    dialectOptions: {
      charset: "utf8mb4",
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : undefined,
    },
  }
);

export default sequelize;
