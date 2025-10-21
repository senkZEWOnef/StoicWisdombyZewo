/// <reference types="vite/client" />

// Type declarations for vite.config.ts
declare module 'vite' {
  export function defineConfig(config: any): any;
  export * from 'vite';
}

declare module '@vitejs/plugin-react' {
  export default function react(options?: any): any;
}