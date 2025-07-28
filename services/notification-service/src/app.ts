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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/internal", internalRoutes);
app.use("/", notificationRoutes);

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Notification service is running!");
});

export default app;
