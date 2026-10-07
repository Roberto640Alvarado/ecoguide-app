"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import { MapPinned, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DriveStep } from "driver.js";
import { parseAsString, useQueryState } from "nuqs";
import { useLanguageStore } from "@/store/language-store";
import { PageTourBanner } from "@/components/layout/page-tour-banner";
import { usePageTour } from "@/hooks/use-page-tour";
import { useProtectedAreas } from "@/features/protected-areas/hooks/use-protected-areas";
import { useStudentProgressOverview } from "@/features/student-progress/hooks/use-student-progress-overview";
import type { StudentAreaProgress } from "@/features/student-progress/types/student-progress.types";
import { stripHtmlToText } from "@/lib/utils/rich-text";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";

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
  const { data: progressData } = useStudentProgressOverview({ limit: 100 });

  const allAreas = allAreasData?.items ?? [];
  const progressByArea = new Map(
    (progressData?.items ?? []).map((item) => [item.protectedAreaId, item]),
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filteredAreas = normalizedSearch
    ? allAreas.filter((area) =>
        area.name.toLowerCase().includes(normalizedSearch),
      )
    : allAreas;

  const en = language === "en";
  const hasCards = !isLoading && filteredAreas.length > 0;

  const tourSteps = useMemo<DriveStep[]>(() => {
    if (isLoading) {
      return [];
    }

    const steps: DriveStep[] = [
      {
        element: '[data-tour="map"]',
        popover: {
          title: en ? "Map of El Salvador" : "Mapa de El Salvador",
          description: en
            ? "Every pin is a protected area. On a computer, hover a pin to preview its photos and use \"Explore this area\"; on your phone, tap a pin to open the area."
            : "Cada pin es un área protegida. En computadora, pasa el cursor sobre un pin para ver sus fotos y usa \"Explorar esta área\"; en el celular, toca un pin para abrir el área.",
        },
      },
      {
        element: '[data-tour="search"]',
        popover: {
          title: en ? "Search" : "Buscar",
          description: en
            ? "Type a name to filter the cards below. The map always shows every area."
            : "Escribe un nombre para filtrar las tarjetas de abajo. El mapa siempre muestra todas las áreas.",
        },
      },
    ];

    if (hasCards) {
      steps.push({
        element: '[data-tour="cards"]',
        popover: {
          title: en ? "Your areas" : "Tus áreas",
          description: en
            ? "Each card shows your steps completed and a progress bar. Open one to start its path: flashcards, speaking, chatbot and test."
            : "Cada tarjeta muestra tus pasos completados y una barra de avance. Abre una para empezar su ruta: flashcards, speaking, chatbot y examen.",
        },
      });
    }

    return steps;
  }, [isLoading, hasCards, en]);

  const { start: startTour } = usePageTour({
    steps: tourSteps,
    storageKey: "student-protected-areas",
  });

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

      <PageTourBanner
        title={en ? "New here? Take the tour" : "¿Primera vez aquí? Haz el tour"}
        description={
          en
            ? "Learn how to use the map, search areas and start your learning path."
            : "Aprende a usar el mapa, buscar áreas y empezar tu ruta de aprendizaje."
        }
        buttonLabel={en ? "Take the tour" : "Ver tour guiado"}
        onStart={startTour}
      />

      <motion.div
        data-tour="map"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <ProtectedAreasMap areas={allAreas} />
      </motion.div>

      <div data-tour="search" className="relative w-full sm:max-w-xs">
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
        <div data-tour="cards" className="flex flex-col gap-4">
          {/* Mobile: fila horizontal deslizable con scroll-snap. */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:hidden">
            {filteredAreas.map((area, index) => (
              <AreaCard
                key={area.id}
                area={area}
                progress={progressByArea.get(area.id)}
                index={index}
                variant="mobile"
              />
            ))}
          </div>

          {/* Desktop/tablet: grilla normal. */}
          <div className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
            {filteredAreas.map((area, index) => (
              <AreaCard
                key={area.id}
                area={area}
                progress={progressByArea.get(area.id)}
                index={index}
                variant="grid"
              />
            ))}
          </div>
        </div>
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
  progress?: StudentAreaProgress;
  index: number;
  variant: "mobile" | "grid";
}

function AreaCard({ area, progress, index, variant }: AreaCardProps) {
  const language = useLanguageStore((state) => state.language);
  const coverImage = area.images[0];
  const progressPercent = progress?.progressPercent ?? 0;
  const stepsCompleted = progress?.stepsCompleted ?? 0;
  const stepsTotal = progress?.stepsTotal ?? 0;
  const [translatedName, translatedDescription] = useTranslatedTexts([
    area.name,
    stripHtmlToText(area.description),
  ]);

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
              {translatedName}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-white/85">
              {translatedDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">
              {language === "en" ? "Your progress" : "Tu avance"}
            </span>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-soft-foreground">
              {stepsCompleted}/{stepsTotal}{" "}
              {language === "en" ? "steps" : "pasos"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-default-soft">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
