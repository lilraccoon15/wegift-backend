import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import "./config/loadEnv";
import cookieParser from "cookie-parser";
import wishlistRoutes from "./routes/wishlistRoutes";
import errorHandler from "./middlewares/errorHandler";
import setupAssociations from "./models/setupAssociations";
import internalRoutes from "./routes/internalRoutes";

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

app.use("/uploads", express.static("public/uploads"));
app.use("/api/internal", internalRoutes);
app.use("/", wishlistRoutes);

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Wishlist service is running!");
});

export default app;
