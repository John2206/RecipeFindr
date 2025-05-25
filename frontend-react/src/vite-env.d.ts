/// <reference types="vite/client" />

// Global type definitions for the application

// Environment variables interface
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_PORT: string
  readonly VITE_APP_HOST: string
  readonly VITE_BUILD_SOURCEMAP: string
  readonly VITE_BUILD_OUTDIR: string
  readonly VITE_DEBUG_API: string
  readonly VITE_DEBUG_AUTH: string
}

// Global constants injected by Vite
declare const __API_BASE_URL__: string
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string
