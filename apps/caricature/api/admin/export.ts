import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasAdminSession } from "../../server/admin-auth.js";
import {
  APP_IDS,
  ensureContactsSchema,
  getDatabase,
  isAppId,
  type AppId,
} from "../../server/database.js";

const APP_LABELS: Record<AppId, string> = {
  "app-1": "CAMIONES",
  "app-2": "PICKUP",
  "app-3": "MULTIMAO",
};

function getSingleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function escapeCsvValue(value: unknown) {
  let text = String(value ?? "");

  // Evita que Excel interprete datos importados como fórmulas.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
}

function getAppLabel(value: unknown) {
  return isAppId(value) ? APP_LABELS[value] : String(value ?? "");
}

function formatCsvDate(value: unknown) {
  const text = String(value ?? "");
  if (!text) return "";

  const normalized = text.includes("T") || text.endsWith("Z")
    ? text
    : `${text.replace(" ", "T")}Z`;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? text : date.toISOString();
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
  if (sourceApp !== undefined && !isAppId(sourceApp)) {
    return res.status(400).json({ error: "Aplicación inválida" });
  }

  try {
    await ensureContactsSchema();

    const filters = sourceApp
      ? {
          sql: `
            SELECT full_name, email, phone, source_app, created_at
            FROM contacts
            WHERE source_app = ?
            ORDER BY created_at DESC, id DESC
          `,
          args: [sourceApp],
        }
      : {
          sql: `
            SELECT full_name, email, phone, source_app, created_at
            FROM contacts
            WHERE source_app IN (?, ?, ?)
            ORDER BY created_at DESC, id DESC
          `,
          args: [...APP_IDS],
        };

    const result = await getDatabase().execute(filters);
    const rows = result.rows.map((contact) => [
      contact.full_name,
      contact.email,
      contact.phone,
      getAppLabel(contact.source_app),
      formatCsvDate(contact.created_at),
    ]);
    const header = ["Nombre", "Correo", "Teléfono", "Aplicación", "Fecha de registro"];
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");
    const filename = sourceApp
      ? `interesados-${sourceApp}.csv`
      : "interesados-todas-las-aplicaciones.csv";

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    // BOM para que Excel reconozca correctamente tildes y eñes.
    return res.status(200).send(`\uFEFF${csv}\r\n`);
  } catch (error) {
    console.error("Error exportando contactos:", error);
    return res.status(500).json({ error: "No se pudieron exportar los contactos" });
  }
}
