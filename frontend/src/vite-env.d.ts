/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL?: string;
  [key: string]: any;
}

interface ImportMeta {
  env: ImportMetaEnv;
}
