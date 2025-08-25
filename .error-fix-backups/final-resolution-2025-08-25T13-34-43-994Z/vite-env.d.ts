/// <reference types="vite/client" />

interface ImportMetaEnv {
 readonly VITE_YOUTUBE_API_KEY: string
 readonly VITE_GOOGLE_SEARCH_API_KEY: string
 readonly VITE_GOOGLE_SEARCH_ENGINE_ID: string
 readonly MODE: string
 readonly DEV: boolean
 readonly PROD: boolean
 // more env variables...
}

interface ImportMeta {
 readonly env: ImportMetaEnv
}