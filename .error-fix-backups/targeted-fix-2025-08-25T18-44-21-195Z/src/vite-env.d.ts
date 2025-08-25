// / <reference types="vite/client" />
// / <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
 readonly VITE_YOUTUBE_API_KEY: string;
 readonly VITE_GOOGLE_SEARCH_API_KEY: string;
 readonly VITE_GOOGLE_SEARCH_ENGINE_ID: string;
 readonly MODE: string;
 // more env variables...

interface ImportMeta {
 readonly env: ImportMetaEnv;
