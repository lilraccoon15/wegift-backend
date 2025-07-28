import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import "./config/loadEnv";
import cookieParser from "cookie-parser";
import notificationRoutes from "./routes/notificationRoutes";
import errorHandler from "./middlewares/errorHandler";
import setupAssociations from "./models/setupAssociations";
import internalRoutes from "./routes/internalRoutes";

const app = express();

setupAssociations();

cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim());

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Origin not allowed"));
    }
  },
  credentials: true,
});

app.use(cookieParser());
app.use(express.json());

app.use("/api/internal", internalRoutes);
app.use("/", notificationRoutes);

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Notification service is running!");
});

export default app;
