"use client";

import dynamic from "next/dynamic";

// Preline solo se ejecuta en el cliente (manipula el DOM directamente),
// por lo que se carga con ssr:false para evitar errores de hidratación.
const PrelineScript = dynamic(() => import("./preline-script"), {
  ssr: false,
});

export default function PrelineScriptWrapper() {
  return <PrelineScript />;
}
