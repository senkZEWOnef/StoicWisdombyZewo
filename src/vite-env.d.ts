/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// CSS modules
declare module "*.css" {
  const content: string;
  export default content;
}

// React DOM client fix for newer versions
declare module 'react-dom/client' {
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(container: Element | DocumentFragment, initialChildren: React.ReactNode): Root;
}
