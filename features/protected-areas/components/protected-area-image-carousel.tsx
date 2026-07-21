"use client";

import { useEffect, useId } from "react";
import { ChevronLeft, ChevronRight, MapPinned } from "lucide-react";

interface ProtectedAreaImageCarouselProps {
  images: string[];
  alt: string;
}

/**
 * Carrusel de imágenes del área (portada + galería) para la vista de
 * detalle del estudiante. Usa el plugin hs-carousel de Preline UI (mismo
 * patrón adoptado para el sidebar) en vez de Embla: swipe/drag nativo,
 * flechas y miniaturas resueltos por la librería, sin duplicar lógica de
 * carrusel en el proyecto.
 */
export function ProtectedAreaImageCarousel({
  images,
  alt,
}: ProtectedAreaImageCarouselProps) {
  const carouselId = `pa-carousel-${useId()}`;

  // El loader global (PrelineScript) solo reescanea el DOM al cambiar de
  // ruta. Este carrusel puede montarse después (ej. al resolver React Query
  // la petición del área protegida), así que se reinicializa aquí cuando
  // cambia la lista de imágenes.
  useEffect(() => {
    if (images.length === 0) return;
    import("preline").then(() => {
      window.HSStaticMethods.autoInit(["carousel"]);
    });
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="flex h-56 w-full items-center justify-center bg-accent-soft sm:h-72">
        <MapPinned
          className="h-10 w-10 text-accent-soft-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      id={carouselId}
      data-hs-carousel='{"loadingClasses": "opacity-0"}'
      className="relative"
    >
      <div className="hs-carousel flex flex-col sm:flex-row gap-2">
        {/* Slide principal */}
        <div className="sm:order-2 relative grow overflow-hidden h-56 sm:h-72 rounded-lg">
          <div className="hs-carousel-body absolute top-0 bottom-0 inset-s-0 flex flex-nowrap transition-transform duration-700 opacity-0">
            {images.map((url, index) => (
              <div key={url} className="hs-carousel-slide h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${alt} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              {/* Arrows */}
              <button
                type="button"
                aria-label={`Previous image of ${alt}`}
                className="hs-carousel-prev hs-carousel-disabled:opacity-50 hs-carousel-disabled:cursor-default absolute top-1/2 inset-s-2 inline-flex justify-center items-center size-10 bg-layer text-layer-foreground rounded-full shadow-2xs hover:bg-layer-hover -translate-y-1/2 focus:outline-hidden"
              >
                <ChevronLeft className="size-5 shrink-0" aria-hidden="true" />
                <span className="sr-only">Previous</span>
              </button>
              <button
                type="button"
                aria-label={`Next image of ${alt}`}
                className="hs-carousel-next hs-carousel-disabled:opacity-50 hs-carousel-disabled:cursor-default absolute top-1/2 inset-e-2 inline-flex justify-center items-center size-10 bg-layer text-layer-foreground rounded-full shadow-2xs hover:bg-layer-hover -translate-y-1/2 focus:outline-hidden"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
              </button>
              {/* End Arrows */}
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="sm:order-1 flex-none">
            <div className="hs-carousel-pagination max-h-72 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
              {images.map((url, index) => (
                <div
                  key={url}
                  className="hs-carousel-pagination-item shrink-0 border border-line-2 rounded-md overflow-hidden cursor-pointer size-16 sm:size-20 hs-carousel-active:border-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${alt} ${index + 1} miniatura`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* End Thumbnails */}
      </div>
    </div>
  );
}
