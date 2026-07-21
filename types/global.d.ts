// Tipado compartido para el objeto global que expone Preline UI en window.
// Ver: https://preline.co/docs/frameworks-nextjs.html

declare global {
  interface Window {
    HSStaticMethods: {
      autoInit: (collection?: string[]) => void;
    };
  }
}

export {};
