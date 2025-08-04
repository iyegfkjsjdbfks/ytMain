/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

declare global {
  namespace Vi {
    interface AssertsShape {
      toBeInTheDocument(): void;
    }
  }
}

export {};