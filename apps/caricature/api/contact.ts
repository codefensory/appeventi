import { createClient } from "@libsql/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let db: ReturnType<typeof createClient> | undefined;
let schemaPromise: Promise<unknown> | undefined;

const APP_IDS = new Set(["app-1", "app-2", "app-3"]);

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
    schemaPromise = (async () => {
      const database = getDatabase();
      await database.execute(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          accepts_communications INTEGER NOT NULL,
          source_app TEXT NOT NULL DEFAULT 'app-1',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // La tabla puede existir desde antes de agregar las tres aplicaciones.
      // En ese caso se migra sin perder los contactos ya guardados.
      const columns = await database.execute("PRAGMA table_info(contacts)");
      const hasSourceApp = columns.rows.some((column) => column.name === "source_app");
      if (!hasSourceApp) {
        await database.execute(
          "ALTER TABLE contacts ADD COLUMN source_app TEXT NOT NULL DEFAULT 'app-1'",
        );
      }
    })().catch((error) => {
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

  const { fullName, email, phone, acceptsCommunications, sourceApp } = body;

  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    acceptsCommunications !== true ||
    typeof sourceApp !== "string" ||
    !APP_IDS.has(sourceApp) ||
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
