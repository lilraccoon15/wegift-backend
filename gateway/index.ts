import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { IncomingMessage, ServerResponse } from "http";
import config from "./config";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// CORS Origins autorisés
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Origin not allowed"));
      }
    },
    credentials: true,
  })
);

// Ajoute les headers CORS à la réponse proxy
const addCorsHeaders = (proxyRes: IncomingMessage, req: IncomingMessage) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    proxyRes.headers ??= {};
    proxyRes.headers["access-control-allow-origin"] = origin;
    proxyRes.headers["access-control-allow-credentials"] = "true";
    proxyRes.headers["vary"] = "Origin";
  }
};

// Gestion d'erreur proxy
const onProxyError = (
  err: unknown,
  _req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) => {
  console.error("❌ Proxy error:", err);
  res.writeHead(502, { "Content-Type": "text/plain" });
  res.end("Bad Gateway");
};

// Utilitaire pour DRY les déclarations
const setupProxy = (
  path: string,
  target: string,
  rewriteRegex: string,
  rewriteTo: string = ""
) => {
  app.use(
    path,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [rewriteRegex]: rewriteTo },
      onProxyRes: addCorsHeaders,
      onError: onProxyError,
    } as Parameters<typeof createProxyMiddleware>[0])
  );
};

app.use(cookieParser());

// Déclaration des proxys
setupProxy("/api/auth", config.AUTH_SERVICE, "^/api/auth");
setupProxy("/api/exchange", config.EXCHANGE_SERVICE, "^/api/exchange");
setupProxy("/api/users", config.USER_SERVICE, "^/api/users");
setupProxy("/api/wishlist", config.WISHLIST_SERVICE, "^/api/wishlist");
setupProxy(
  "/api/notification",
  config.NOTIFICATION_SERVICE,
  "^/api/notification"
);
setupProxy(
  "/uploads/users",
  config.USER_SERVICE,
  "^/uploads/users",
  "/uploads"
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Gateway en écoute sur http://0.0.0.0:${PORT}`);
  console.log("🚀 USER_SERVICE =", config.USER_SERVICE);
});
