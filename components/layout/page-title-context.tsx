"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

interface PageTitleValue {
  icon: LucideIcon | null;
  title: string;
}

interface PageTitleContextValue {
  pageTitle: PageTitleValue;
  setPageTitle: (value: PageTitleValue) => void;
}

const EMPTY_PAGE_TITLE: PageTitleValue = { icon: null, title: "" };

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

// Puente cliente-a-cliente entre el contenido de cada página (donde vive
// <PageHeader>, el productor) y el topbar de DashboardShell (el
// consumidor), que vive en el layout compartido y no puede recibir el
// título por props. Ver CLAUDE.md, sección "Sistema de Diseño".
export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitleState] =
    useState<PageTitleValue>(EMPTY_PAGE_TITLE);

  const setPageTitle = useCallback((value: PageTitleValue) => {
    setPageTitleState(value);
  }, []);

  const value = useMemo(
    () => ({ pageTitle, setPageTitle }),
    [pageTitle, setPageTitle],
  );

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitleContext() {
  const context = useContext(PageTitleContext);

  if (!context) {
    throw new Error(
      "usePageTitleContext debe usarse dentro de <PageTitleProvider>",
    );
  }

  return context;
}
