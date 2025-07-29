import { Dialect } from "sequelize";
import * as dotenv from "dotenv";
dotenv.config();

interface SequelizeConfig {
    username: string;
    password: string | null;
    database: string;
    host: string;
    port?: number;
    dialect: Dialect;
}

const config: { [env: string]: SequelizeConfig } = {
    development: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || "wegift_notification_dev",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mariadb",
    },
    test: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || "wegift_notification_test",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mariadb",
    },
    production: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || "wegift_notification",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mariadb",
    },
};

export default config;
