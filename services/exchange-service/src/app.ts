import iconv from "iconv-lite";
import encodings from "iconv-lite/encodings";
(iconv as any).encodings = encodings;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import exchangeRoutes from "./routes/exchangeRoutes";

if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use('/', exchangeRoutes);

app.get("/", (_req, res) => {
  res.send("Exchange service is running!");
});

export default app;
