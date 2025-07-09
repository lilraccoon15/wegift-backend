import dotenv from "dotenv";

const envPath = process.env.NODE_ENV?.startsWith("test") ? ".env.test" : ".env";

dotenv.config({ path: envPath });
