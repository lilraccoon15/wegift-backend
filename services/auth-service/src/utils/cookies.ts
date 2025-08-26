import type { Response } from "express";
const isProd = process.env.NODE_ENV === "production";
const base = { httpOnly: true, secure: isProd, sameSite: "lax" as const };
const domainOpt = process.env.COOKIE_DOMAIN
  ? { domain: process.env.COOKIE_DOMAIN }
  : {};

export const setAccessCookie = (
  res: Response,
  token: string,
  maxAgeMs: number
) =>
  res.cookie("accessToken", token, {
    ...base,
    ...domainOpt,
    path: "/",
    maxAge: maxAgeMs,
  });

export const setRefreshCookie = (
  res: Response,
  raw: string,
  remember: boolean,
  maxAgeMs: number
) =>
  res.cookie("refreshToken", raw, {
    ...base,
    ...domainOpt,
    path: "/",
    ...(remember ? { maxAge: maxAgeMs } : {}),
  });

export const setSidCookie = (
  res: Response,
  sid: string,
  remember: boolean,
  maxAgeMs: number
) =>
  res.cookie("sid", sid, {
    ...base,
    ...domainOpt,
    path: "/",
    ...(remember ? { maxAge: maxAgeMs } : {}),
  });

export const clearAuthCookies = (res: Response) => {
  const opts = { ...base, ...domainOpt, path: "/" };
  res.clearCookie("accessToken", opts);
  res.clearCookie("refreshToken", opts);
  res.clearCookie("sid", opts);
};
