import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import config from "./config";

const app = express();
const PORT = 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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

const addCorsHeaders = (proxyRes: any, req: any) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    proxyRes.headers["Access-Control-Allow-Origin"] = origin;
    proxyRes.headers["Access-Control-Allow-Credentials"] = "true";
    proxyRes.headers["Vary"] = "Origin";
  }
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

app.listen(PORT, () => {
  console.log(`API Gateway en écoute sur http://localhost:${PORT}`);
});
