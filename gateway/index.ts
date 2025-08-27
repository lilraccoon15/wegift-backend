import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import config from "./config";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
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
  })
);

const addCorsHeaders = (proxyRes: any, req: any) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    proxyRes.headers["Access-Control-Allow-Origin"] = origin;
    proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
    proxyRes.headers["Vary"] = "Origin";
  }

  proxyRes.headers["Cache-Control"] =
    "no-store, no-cache, must-revalidate, proxy-revalidate";
  proxyRes.headers["Pragma"] = "no-cache";
  proxyRes.headers["Expires"] = "0";
};

app.use(cookieParser());

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: config.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    onProxyRes: addCorsHeaders,
  } as any)
);

app.use(
  "/api/exchange",
  createProxyMiddleware({
    target: config.EXCHANGE_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/exchange": "" },
    onProxyRes: addCorsHeaders,
  } as any)
);

app.use(
  "/uploads/users",
  createProxyMiddleware({
    target: config.USER_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/uploads/users": "/uploads" },
    onProxyRes: addCorsHeaders,
  } as any)
);

app.use(
  "/api/users",
  createProxyMiddleware({
    target: config.USER_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
    onProxyRes: addCorsHeaders,
  } as any)
);

app.use(
  "/api/wishlist",
  createProxyMiddleware({
    target: config.WISHLIST_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/wishlist": "" },
    onProxyRes: addCorsHeaders,
  } as any)
);

app.use(
  "/api/notification",
  createProxyMiddleware({
    target: config.NOTIFICATION_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/notification": "" },
    onProxyRes: addCorsHeaders,
  } as any)
);

app.use(
  "/",
  createProxyMiddleware({
    target: config.FRONTEND_SERVICE,
    changeOrigin: true,
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway en écoute sur http://0.0.0.0:${PORT}`);
});
