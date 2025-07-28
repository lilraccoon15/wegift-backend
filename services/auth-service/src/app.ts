import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import "./config/loadEnv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middlewares/errorHandler";
import "./passport/googleStrategy";
import passport from "passport";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());

app.use("/img", express.static("public/img"));
app.use("/", authRoutes);

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.send("Auth service is running!");
});

export default app;
