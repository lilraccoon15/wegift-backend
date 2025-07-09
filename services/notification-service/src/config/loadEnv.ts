import dotenv from "dotenv";

const envPath = process.env.NODE_ENV?.startsWith("test") ? ".env.test" : ".env";

dotenv.config({ path: envPath });
console.log(`Chargement de ${envPath} (NODE_ENV = ${process.env.NODE_ENV})`);
