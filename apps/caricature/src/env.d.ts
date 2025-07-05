/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CLOUDINARY_UPLOAD_PRESET: string;
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly GENERATING_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 