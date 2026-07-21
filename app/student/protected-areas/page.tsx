"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import { MapPinned, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedAreas } from "@/features/protected-areas/hooks/use-protected-areas";
import { stripHtmlToText } from "@/lib/utils/rich-text";

const ProtectedAreasMap = dynamic(
  () =>
    import("@/features/protected-areas/components/protected-areas-map").then(
      (mod) => mod.ProtectedAreasMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 w-full items-center justify-center rounded-3xl border border-border bg-surface-secondary sm:h-[26rem]">
        <Spinner size="md" />
      </div>
    ),
  },
);

export default function StudentProtectedAreasPage() {
  const language = useLanguageStore((state) => state.language);

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // El backend fuerza isPublished=true para STUDENT, así que no hace falta
  // pasar ese filtro aquí (ver ProtectedAreasService.findAll). El mapa
  // siempre recibe TODAS las áreas (sin buscador) para que los pines no
  // desaparezcan mientras el estudiante escribe; la búsqueda solo filtra
  // la lista/carrusel de tarjetas de abajo.
  const { data: allAreasData, isLoading } = useProtectedAreas({
    page: 1,
    limit: 100,
    sort: "name:asc",
  });

  const allAreas = allAreasData?.items ?? [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredAreas = normalizedSearch
    ? allAreas.filter((area) =>
        area.name.toLowerCase().includes(normalizedSearch),
      )
    : allAreas;

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <MapPinned className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "en" ? "Protected Areas" : "Áreas protegidas"}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Tap a pin, its name, or a card below to start exploring."
              : "Toca un pin, su nombre, o una tarjeta de abajo para empezar a explorar."}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <ProtectedAreasMap areas={allAreas} />
      </motion.div>

      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={
            language === "en" ? "Search areas..." : "Buscar áreas..."
          }
          className="input w-full pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : filteredAreas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
          {language === "en"
            ? "No protected areas found."
            : "No se encontraron áreas protegidas."}
        </div>
      ) : (
        <>
          {/* Mobile: fila horizontal deslizable con scroll-snap. */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:hidden">
            {filteredAreas.map((area, index) => (
              <AreaCard key={area.id} area={area} index={index} variant="mobile" />
            ))}
          </div>

          {/* Desktop/tablet: grilla normal. */}
          <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
            {filteredAreas.map((area, index) => (
              <AreaCard key={area.id} area={area} index={index} variant="grid" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface AreaCardProps {
  area: {
    id: string;
    name: string;
    description: string;
    images: string[];
  };
  index: number;
  variant: "mobile" | "grid";
}

// TODO(StudentProgress): el módulo StudentProgress todavía no existe en la
// API (ver CLAUDE.md, sección "Pendientes en la API"). El progreso y la
// nota de abajo son datos de ejemplo quemados solo para previsualizar el
// diseño de la tarjeta; hay que reemplazarlos por el hook real
// (useStudentProgress(area.id) o similar) en cuanto el endpoint exista.
const MOCK_PROGRESS_PERCENT = 45;
const MOCK_GRADE = "8.5";

function AreaCard({ area, index, variant }: AreaCardProps) {
  const language = useLanguageStore((state) => state.language);
  const coverImage = area.images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className={
        variant === "mobile" ? "w-64 shrink-0 snap-start" : undefined
      }
    >
      <Link
        href={`/student/protected-areas/${area.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md"
      >
        {/* Portada: foto + título/descripción superpuestos (mismo patrón
            que ProtectedAreaCard, la tarjeta del panel docente). */}
        <div
          className={`relative w-full shrink-0 bg-accent-soft ${
            variant === "mobile" ? "h-36" : "h-48 sm:h-52"
          }`}
        >
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={area.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPinned
                className="h-8 w-8 text-accent-soft-foreground"
                aria-hidden="true"
              />
            </div>
          )}

          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent p-4">
            <h3 className="line-clamp-1 font-semibold text-white">
              {area.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/85">
              {stripHtmlToText(area.description)}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">
              {language === "en" ? "Your progress" : "Tu avance"}
            </span>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-soft-foreground">
              {language === "en" ? "Grade" : "Nota"} {MOCK_GRADE}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-default-soft">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${MOCK_PROGRESS_PERCENT}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
