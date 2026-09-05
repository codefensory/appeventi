import { createClient } from "@libsql/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let db: ReturnType<typeof createClient> | undefined;
let schemaPromise: Promise<unknown> | undefined;

function getDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN");
  }

  return (db ??= createClient({ url, authToken }));
}

function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = getDatabase()
      .execute(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          accepts_communications INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      .catch((error) => {
        schemaPromise = undefined;
        throw error;
      });
  }

  return schemaPromise;
}

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

  const { fullName, email, phone, acceptsCommunications } = body;

  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    acceptsCommunications !== true ||
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  try {
    await ensureSchema();
    await getDatabase().execute({
      sql: `
        INSERT INTO contacts
          (full_name, email, phone, accepts_communications)
        VALUES (?, ?, ?, ?)
      `,
      args: [fullName.trim(), email.trim(), phone.trim(), 1],
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Error guardando contacto en Turso:", error);
    return res.status(500).json({ error: "No se pudo guardar el contacto" });
  }
}
