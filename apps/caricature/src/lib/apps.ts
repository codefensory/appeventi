/** Identidad única de la instalación: un solo negocio por kiosco. */
export const APP = {
  id: "app-1",
  label: "Art Inmobiliaria",
  logoSrc: "/logo.png",
  photoMessage: ["Confianza que", "construye tu futuro."],
} as const;

export type AppId = (typeof APP)["id"];
