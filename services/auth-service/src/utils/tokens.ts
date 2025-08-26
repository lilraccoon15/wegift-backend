import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import config from "../config";

export const ACCESS_TTL_SEC = 30 * 60; // 30 minutes
export const REFRESH_TTL_SEC = (remember: boolean) =>
  remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30j vs 24h

export const signAccess = (
  payload: { id: string; userId: string }, // les deux IDs
  ttlSec = ACCESS_TTL_SEC
) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: ttlSec,
    audience: config.jwtAudience,
    issuer: config.jwtIssuer,
  });
};

export const newRefreshRaw = () => crypto.randomBytes(48).toString("base64url");
export const hashRefresh = (raw: string) => bcrypt.hash(raw, 12);
export const compareRefresh = (raw: string, hash: string) =>
  bcrypt.compare(raw, hash);
