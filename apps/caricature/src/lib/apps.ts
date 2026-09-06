export const APPS = [
  {
    id: "app-1",
    label: "App 1",
    logoSrc: "/logo.png",
    photoMessage: ["Confianza que mueve", "tu negocio."],
  },
  {
    id: "app-2",
    label: "App 2",
    logoSrc: "/logo2.png",
    photoMessage: ["Confianza para llegar", "mas lejos."],
  },
  {
    id: "app-3",
    label: "App 3",
    logoSrc: "/logo3.png",
    photoMessage: ["Confianza que", "impulsa tus proyectos."],
  },
] as const;

export type AppId = (typeof APPS)[number]["id"];
export type AppConfig = (typeof APPS)[number];

export const DEFAULT_APP_ID: AppId = "app-1";

export function isAppId(value: unknown): value is AppId {
  return APPS.some((app) => app.id === value);
}

export function getAppConfig(appId: AppId): AppConfig {
  return APPS.find((app) => app.id === appId) ?? APPS[0];
}

/** Permite abrir cada instalación directamente con ?app=1, ?app=2 o ?app=3. */
export function getInitialAppId(): AppId {
  const queryApp = new URLSearchParams(window.location.search).get("app");
  const normalizedApp = queryApp?.match(/^app-?([1-3])$/i)?.[1];
  const appId = normalizedApp ? `app-${normalizedApp}` : queryApp;
  if (isAppId(appId)) return appId;

  const configuredApp = import.meta.env.VITE_APP_ID;
  return isAppId(configuredApp) ? configuredApp : DEFAULT_APP_ID;
}
