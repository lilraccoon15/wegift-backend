import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "./config";

const app = express();
const PORT = 4000;

const allowedOrigins = ["http://localhost:3000"];

const addCorsHeaders = (proxyRes: any, req: any) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    proxyRes.headers['Access-Control-Allow-Origin'] = origin;
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Vary'] = 'Origin';

  }
};

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Origine non autorisée."));
    }
  },
  credentials: true,
}));

app.use(cookieParser());

app.use("/api/auth", createProxyMiddleware({
  target: config.authServiceUrl,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
  onProxyRes: addCorsHeaders,
} as any));

// Les autres proxys
app.use("/api/exchange", createProxyMiddleware({
  target: config.exchangeServiceUrl,
  changeOrigin: true,
  pathRewrite: { '^/api/exchange': '' },
  onProxyRes: addCorsHeaders,
} as any));

app.use("/api/users", createProxyMiddleware({
  target: config.usersServiceUrl,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
  onProxyRes: addCorsHeaders,
} as any));

app.use("/api/wishlist", createProxyMiddleware({
  target: config.wishlistServiceUrl,
  changeOrigin: true,
  pathRewrite: { '^/api/wishlist': '' },
  onProxyRes: addCorsHeaders,
} as any));

app.listen(PORT, () => {
  console.log(`API Gateway en écoute sur http://localhost:${PORT}`);
});
