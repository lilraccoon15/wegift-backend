const path = require("path");
require("dotenv").config();

const commonConfig = {
  migrationStorageTableName: "sequelize_meta",
  seederStorageTableName: "sequelize_data",
};

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "wegift_notifications_dev",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mariadb",
    ...commonConfig,
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "wegift_notifications_test",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mariadb",
    ...commonConfig,
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || "wegift_notifications",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mariadb",
    ...commonConfig,
    migrationStorageTableName: "SequelizeMeta",
    seederStorageTableName: "sequelize_data",
  },
};
