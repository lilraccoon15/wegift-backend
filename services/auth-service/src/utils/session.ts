import { Response } from "express";
import {
  signAccess,
  newRefreshRaw,
  hashRefresh,
  REFRESH_TTL_SEC,
  ACCESS_TTL_SEC,
} from "./tokens";
import { setAccessCookie, setRefreshCookie, setSidCookie } from "./cookies";
import { Session } from "../models/Session";
import ms from "ms";

export async function createSessionAndSetCookies(
  res: Response,
  id: string,
  userId: string,
  remember: boolean
) {
  const accessTtl = ACCESS_TTL_SEC; // 30 min
  const refreshTtl = REFRESH_TTL_SEC(remember); // 1 jour ou 30 jours
  const accessMaxAge = accessTtl * 1000;
  const refreshMaxAge = refreshTtl * 1000;

  // Créer le token d'accès
  const accessToken = signAccess({ id, userId }, accessTtl);

  // Générer le refresh token brut et hashé
  const rawRefresh = newRefreshRaw();
  const hashedRefresh = await hashRefresh(rawRefresh);

  const expiresAt = new Date(Date.now() + refreshMaxAge);

  // Créer une session en base
  const session = await Session.create({
    userId,
    refreshHash: hashedRefresh,
    ua: res.req.headers["user-agent"] || null,
    ip: res.req.ip || null,
    remember,
    expiresAt,
    lastUsedAt: new Date(),
  });

  // Définir les cookies
  setAccessCookie(res, accessToken, accessMaxAge);
  setRefreshCookie(res, rawRefresh, remember, refreshMaxAge);
  setSidCookie(res, session.id, remember, refreshMaxAge);
}
