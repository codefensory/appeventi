import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  isAdminConfigured,
  setAdminSession,
  verifyAdminPassword,
} from "../../server/admin-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  let password: unknown;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    password = body?.password;
  } catch {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  if (typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  if (!isAdminConfigured()) {
    console.error("La autenticación de administrador no está configurada");
    return res.status(500).json({ error: "No se pudo iniciar sesión" });
  }

  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  setAdminSession(res);
  return res.status(200).json({ ok: true });
}
