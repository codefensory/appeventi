import { createClient } from "@libsql/client";

export const APP_IDS = ["app-1", "app-2", "app-3"] as const;
export type AppId = (typeof APP_IDS)[number];

let db: ReturnType<typeof createClient> | undefined;
let schemaPromise: Promise<void> | undefined;

export function isAppId(value: unknown): value is AppId {
  return typeof value === "string" && (APP_IDS as readonly string[]).includes(value);
}

export function getDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN");
  }

  return (db ??= createClient({ url, authToken }));
}

export function ensureContactsSchema() {
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
      const columns = await database.execute("PRAGMA table_info(contacts)");
      const hasSourceApp = columns.rows.some((column) => column.name === "source_app");
      if (!hasSourceApp) {
        await database.execute(
          "ALTER TABLE contacts ADD COLUMN source_app TEXT NOT NULL DEFAULT 'app-1'",
        );
      }

      await database.execute(`
        CREATE INDEX IF NOT EXISTS contacts_source_app_created_at_idx
        ON contacts (source_app, created_at DESC)
      `);
    })().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }

  return schemaPromise;
}
