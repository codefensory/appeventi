import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasAdminSession } from "../../server/admin-auth.js";
import {
  ensureContactsSchema,
  getDatabase,
  isAppId,
} from "../../server/database.js";

const PAGE_SIZE = 25;

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRequestedPage(value: string | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!hasAdminSession(req)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const sourceApp = getSingleQueryValue(req.query.app);
  if (!isAppId(sourceApp)) {
    return res.status(400).json({ error: "Aplicación inválida" });
  }

  const requestedPage = getRequestedPage(getSingleQueryValue(req.query.page));

  try {
    await ensureContactsSchema();
    const database = getDatabase();
    const countResult = await database.execute({
      sql: "SELECT COUNT(*) AS total FROM contacts WHERE source_app = ?",
      args: [sourceApp],
    });
    const total = Number(countResult.rows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);
    const offset = (page - 1) * PAGE_SIZE;

    const contactsResult = await database.execute({
      sql: `
        SELECT id, full_name, email, phone, accepts_communications, source_app, created_at
        FROM contacts
        WHERE source_app = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      args: [sourceApp, PAGE_SIZE, offset],
    });

    const contacts = contactsResult.rows.map((contact) => ({
      id: Number(contact.id),
      fullName: String(contact.full_name ?? ""),
      email: String(contact.email ?? ""),
      phone: String(contact.phone ?? ""),
      acceptsCommunications: Number(contact.accepts_communications) === 1,
      sourceApp: String(contact.source_app ?? ""),
      createdAt: String(contact.created_at ?? ""),
    }));

    return res.status(200).json({ contacts, page, pageSize: PAGE_SIZE, total });
  } catch (error) {
    console.error("Error consultando contactos en Turso:", error);
    return res.status(500).json({ error: "No se pudieron consultar los contactos" });
  }
}
