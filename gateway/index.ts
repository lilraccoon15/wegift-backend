import axios from "axios";

(async () => {
  try {
    const res = await axios.get(
      "https://user-service-production-7bcc.up.railway.app/check-pseudo?pseudo=cam"
    );
    console.log("✅ Test direct vers user-service depuis gateway : ", res.data);
  } catch (err: any) {
    console.error("❌ Test direct vers user-service a échoué :", err.message);
  }
})();

import dotenv from "dotenv";
dotenv.config();

console.log("🧪 RAW ALLOWED_ORIGINS =", process.env.ALLOWED_ORIGINS);

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import type { IncomingMessage, ServerResponse } from "http";
import config from "./config";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Liste des origines autorisées
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(/[,\n;]/) // split sur virgule, saut de ligne, point-virgule
  .map(
    (origin) => origin.replace(/^['";\s]+|['";\s]+$/g, "") // enlève quotes, ;, espaces EN DÉBUT ET FIN
  )
  .filter(Boolean);

console.log("✅ ALLOWED_ORIGINS (parsed):", allowedOrigins);

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

app.use(cookieParser());

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

// Gestion des erreurs proxy
const onProxyError = (
  err: Error,
  _req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
) => {
  console.error("❌ Proxy error:", err.message);
  res.writeHead(502, { "Content-Type": "text/plain" });
  res.end("Bad Gateway");
};

// Fonction DRY de configuration de proxy
// 👇 Ne pas typer manuellement Options<...>
const setupProxy = (
  path: string,
  target: string,
  rewriteRegex: string,
  rewriteTo: string = ""
) => {
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: { [rewriteRegex]: rewriteTo },
    onProxyRes: addCorsHeaders,
    onError: onProxyError,
  };

  console.log(`🔁 Proxy ${path} → ${target}`);

  // 👇 cast ici uniquement pour faire taire TypeScript sur les callbacks non typés
  app.use(path, createProxyMiddleware(proxyOptions as any));
};

// Proxys
setupProxy("/api/auth", config.AUTH_SERVICE, "^/api/auth");
setupProxy("/api/exchange", config.EXCHANGE_SERVICE, "^/api/exchange");
setupProxy("/api/users", config.USER_SERVICE, "^/api/users(.*)", "$1");
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

app.get("/", (_req, res) => {
  res.send("🟢 Gateway is running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Gateway en écoute sur http://0.0.0.0:${PORT}`);
  console.log("🌍 ALLOWED_ORIGINS =", allowedOrigins);
});
