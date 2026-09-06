/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_APP_ID?: "app-1" | "app-2" | "app-3";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 