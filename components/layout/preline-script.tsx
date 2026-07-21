"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Re-inicializa los componentes de Preline UI (hs-overlay del sidebar) en
// cada cambio de ruta, ya que Next.js no vuelve a montar el DOM entre
// navegaciones dentro de un mismo layout.
export default function PrelineScript() {
  const pathname = usePathname();

  useEffect(() => {
    import("preline").then(() => {
      window.HSStaticMethods.autoInit();
    });
  }, [pathname]);

  return null;
}
