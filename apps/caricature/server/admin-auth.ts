import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const COOKIE_NAME = "caricature_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;

function getConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) return null;
  return { password, sessionSecret };
}

function constantTimeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  const length = Math.max(left.length, right.length, 1);
  const paddedLeft = Buffer.alloc(length);
  const paddedRight = Buffer.alloc(length);

  left.copy(paddedLeft);
  right.copy(paddedRight);

  return timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length;
}

function sign(payload: string, sessionSecret: string) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function getCookie(req: VercelRequest, name: string) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? cookie.slice(name.length + 1) : null;
}

function cookieOptions(maxAge: number) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  return `Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
}

export function isAdminConfigured() {
  return getConfig() !== null;
}

export function verifyAdminPassword(password: string) {
  const config = getConfig();
  return config ? constantTimeEqual(password, config.password) : false;
}

export function setAdminSession(res: VercelResponse) {
  const config = getConfig();
  if (!config) throw new Error("Faltan las credenciales del administrador");

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expiresAt}`;
  const token = `${payload}.${sign(payload, config.sessionSecret)}`;

  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; ${cookieOptions(SESSION_SECONDS)}`);
}

export function clearAdminSession(res: VercelResponse) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieOptions(0)}`);
}

export function hasAdminSession(req: VercelRequest) {
  const config = getConfig();
  const token = getCookie(req, COOKIE_NAME);
  if (!config || !token) return false;

  const signatureSeparator = token.lastIndexOf(".");
  if (signatureSeparator < 1) return false;

  const payload = token.slice(0, signatureSeparator);
  const signature = token.slice(signatureSeparator + 1);
  if (!constantTimeEqual(signature, sign(payload, config.sessionSecret))) return false;

  const [, expiration] = payload.split(".");
  const expiresAt = Number(expiration);
  return Number.isSafeInteger(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}
