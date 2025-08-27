import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import "./config/loadEnv";
import cookieParser from "cookie-parser";
import exchangeRoutes from "./routes/exchangeRoutes";
import errorHandler from "./middlewares/errorHandler";
import setupAssociations from "./models/setupAssociations";
import internalRoutes from "./routes/internalRoutes";
import path from "path";

const app = express();
app.set("trust proxy", 1);

setupAssociations();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "../public/uploads"))
);
app.use("/api/internal", internalRoutes);
app.use("/", exchangeRoutes);

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Exchange service is running!");
});

export default app;
