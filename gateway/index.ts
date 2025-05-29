import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 4000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());

app.use("/api/auth", createProxyMiddleware({
  target: "http://localhost:3001",
  changeOrigin: true,
}));

app.use("/api/exchange", createProxyMiddleware({
  target: "http://localhost:3002",
  changeOrigin: true,
}));

app.use("/api/users", createProxyMiddleware({
  target: "http://localhost:3003",
  changeOrigin: true,
}));

app.use("/api/wishlist", createProxyMiddleware({
  target: "http://localhost:3004",
  changeOrigin: true,
}));

app.listen(PORT, () => {
  console.log(`API Gateway en écoute sur http://localhost:${PORT}`);
});
