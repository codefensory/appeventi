import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  ensureContactsSchema,
  getDatabase,
  isAppId,
} from "../server/database";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  let body: Record<string, unknown>;
  try {
    const parsed =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return res.status(400).json({ error: "JSON inválido" });
  }

  const { fullName, email, phone, acceptsCommunications, sourceApp } = body;

  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    acceptsCommunications !== true ||
    !isAppId(sourceApp) ||
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    await ensureContactsSchema();
    await getDatabase().execute({
      sql: `
        INSERT INTO contacts
          (full_name, email, phone, accepts_communications, source_app)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [fullName.trim(), email.trim(), phone.trim(), 1, sourceApp],
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Error guardando contacto en Turso:", error);
    return res.status(500).json({ error: "No se pudo guardar el contacto" });
  }
}
