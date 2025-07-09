import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import "./config/loadEnv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import errorHandler from "./middlewares/errorHandler";
import setupAssociations from "./models/setupAssociations";

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

app.use("/uploads", express.static("public/uploads"));

app.use(errorHandler);

app.use("/", userRoutes);

app.get("/", (_req, res) => {
  res.send("User service is running!");
});

export default app;
