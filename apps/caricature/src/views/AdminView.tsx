import { FormEvent, useEffect, useState } from "react";
import { APPS, type AppId } from "../lib/apps";

interface Contact {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  sourceApp: AppId;
  createdAt: string;
}

interface ContactsResponse {
  contacts: Contact[];
  page: number;
  pageSize: number;
  total: number;
}

type SessionStatus = "checking" | "anonymous" | "authenticated";
type ExportTarget = "all" | AppId;

// Nombres visibles en el panel. Los identificadores app-1/app-2/app-3
// continúan siendo internos para separar los registros en la base de datos.
const ADMIN_APP_LABELS: Record<AppId, string> = {
  "app-1": "CAMIONES",
  "app-2": "PICKUP",
  "app-3": "MULTIMAO",
};

function getErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return fallback;
}

function formatDate(value: string) {
  const normalized = value.includes("T") || value.endsWith("Z")
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const AdminView = () => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("checking");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeApp, setActiveApp] = useState<AppId>("app-1");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportTarget | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/contacts?app=app-1&page=1", {
          signal: controller.signal,
        });

        if (response.status === 401) {
          setSessionStatus("anonymous");
          return;
        }

        if (!response.ok) {
          const data: unknown = await response.json().catch(() => null);
          throw new Error(getErrorMessage(data, "No se pudo comprobar la sesión."));
        }

        setSessionStatus("authenticated");
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoginError(
          error instanceof Error ? error.message : "No se pudo comprobar la sesión.",
        );
        setSessionStatus("anonymous");
      }
    };

    void checkSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const controller = new AbortController();

    const loadContacts = async () => {
      setIsLoadingContacts(true);
      setContactsError(null);

      try {
        const response = await fetch(
          `/api/admin/contacts?app=${encodeURIComponent(activeApp)}&page=${page}`,
          { signal: controller.signal },
        );

        if (response.status === 401) {
          setSessionStatus("anonymous");
          return;
        }

        const data: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(getErrorMessage(data, "No se pudieron cargar los contactos."));
        }

        const result = data as ContactsResponse;
        if (!Array.isArray(result.contacts)) {
          throw new Error("La respuesta del servidor no es válida.");
        }

        setContacts(result.contacts);
        setTotal(result.total);
        if (result.page !== page) setPage(result.page);
      } catch (error) {
        if (controller.signal.aborted) return;
        setContactsError(
          error instanceof Error ? error.message : "No se pudieron cargar los contactos.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoadingContacts(false);
      }
    };

    void loadContacts();
    return () => controller.abort();
  }, [activeApp, page, sessionStatus]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "No se pudo iniciar sesión."));
      }

      setPassword("");
      setSessionStatus("authenticated");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setContacts([]);
      setTotal(0);
      setContactsError(null);
      setSessionStatus("anonymous");
    }
  };

  const changeApp = (appId: AppId) => {
    setActiveApp(appId);
    setPage(1);
  };

  const handleExport = async (appId?: AppId) => {
    const target: ExportTarget = appId ?? "all";
    setExporting(target);
    setExportError(null);

    try {
      const query = appId ? `?app=${encodeURIComponent(appId)}` : "";
      const response = await fetch(`/api/admin/export${query}`);

      if (response.status === 401) {
        setSessionStatus("anonymous");
        return;
      }

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        throw new Error(getErrorMessage(data, "No se pudieron exportar los contactos."));
      }

      const disposition = response.headers.get("Content-Disposition");
      const filename = disposition?.match(/filename="([^"]+)"/i)?.[1]
        ?? (appId
          ? `interesados-${appId}.csv`
          : "interesados-todas-las-aplicaciones.csv");
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "No se pudieron exportar los contactos.",
      );
    } finally {
      setExporting(null);
    }
  };

  if (sessionStatus !== "authenticated") {
    return (
      <main className="admin-page admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <p className="admin-eyebrow">Panel privado</p>
          <h1>Interesados</h1>
          <p>Ingresa la contraseña para consultar las bases de las aplicaciones.</p>
          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            disabled={sessionStatus === "checking" || isLoggingIn}
            required
          />
          {loginError && <p className="admin-form-error" role="alert">{loginError}</p>}
          <button
            className="admin-primary-button"
            type="submit"
            disabled={sessionStatus === "checking" || isLoggingIn}
          >
            {sessionStatus === "checking" ? "Comprobando…" : isLoggingIn ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </main>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <main className="admin-page">
      <section className="admin-panel" aria-labelledby="admin-title">
        <header className="admin-header">
          <div>
            <h1 id="admin-title">Interesados por aplicación</h1>
            <p>Consulta independiente de los registros de cada negocio.</p>
          </div>
          <button className="admin-logout-button" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        <div className="admin-tabs-row">
          <nav className="admin-tabs" aria-label="Bases de contactos">
            {APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                className={app.id === activeApp ? "is-active" : undefined}
                aria-pressed={app.id === activeApp}
                onClick={() => changeApp(app.id)}
              >
                {ADMIN_APP_LABELS[app.id]}
              </button>
            ))}
          </nav>

          <div className="admin-export-actions">
            <button
              className="admin-export-button"
              type="button"
              onClick={() => void handleExport()}
              disabled={exporting !== null}
            >
              {exporting === "all" ? "Exportando…" : "Exportar todo"}
            </button>
            <button
              className="admin-export-button admin-export-button--selected"
              type="button"
              onClick={() => void handleExport(activeApp)}
              disabled={exporting !== null}
            >
              {exporting === activeApp ? "Exportando…" : "Exportar seleccionado"}
            </button>
          </div>
        </div>
        {exportError && <p className="admin-export-error" role="alert">{exportError}</p>}

        <section
          className="admin-contacts"
          aria-live="polite"
          aria-busy={isLoadingContacts}
        >
          {contactsError ? (
            <p className="admin-load-error" role="alert">{contactsError}</p>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Fecha de registro</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingContacts ? (
                    Array.from({ length: 6 }, (_, index) => (
                      <tr key={`skeleton-${index}`} aria-hidden="true">
                        <td><span className="admin-skeleton admin-skeleton--name" /></td>
                        <td><span className="admin-skeleton admin-skeleton--email" /></td>
                        <td><span className="admin-skeleton admin-skeleton--phone" /></td>
                        <td><span className="admin-skeleton admin-skeleton--date" /></td>
                      </tr>
                    ))
                  ) : contacts.length === 0 ? (
                    <tr><td colSpan={4} className="admin-empty-cell">Aún no hay interesados para esta aplicación.</td></tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>{contact.fullName}</td>
                        <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                        <td><a href={`tel:${contact.phone}`}>{contact.phone}</a></td>
                        <td>{formatDate(contact.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && !contactsError && (
            <div className="admin-pagination" aria-label="Paginación">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || isLoadingContacts}
              >
                Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages || isLoadingContacts}
              >
                Siguiente
              </button>
            </div>
          )}

          {!isLoadingContacts && !contactsError && (
            <p className="admin-total">
              {total} {total === 1 ? "interesado registrado" : "interesados registrados"}
            </p>
          )}
        </section>
      </section>
    </main>
  );
};
