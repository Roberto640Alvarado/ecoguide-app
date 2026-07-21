"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPinned } from "lucide-react";

interface ProtectedAreaImageCarouselProps {
  images: string[];
  alt: string;
}

/**
 * Carrusel de imágenes del área (portada + galería) para la vista de
 * detalle del estudiante. Usa Embla para el desplazamiento físico
 * (swipe/drag nativo) y Framer Motion solo para la entrada/salida de los
 * controles y el efecto de "pop" en los indicadores activos.
 */
export function ProtectedAreaImageCarousel({
  images,
  alt,
}: ProtectedAreaImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

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
    <div className="group relative h-56 w-full overflow-hidden sm:h-72">
      <div ref={emblaRef} className="h-full w-full overflow-hidden">
        <div className="flex h-full">
          {images.map((url, index) => (
            <div key={url} className="relative h-full min-w-0 flex-[0_0_100%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${alt} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          {/*
            Visibles siempre en móvil (sin hover disponible; el swipe de
            Embla ya funciona, pero los botones ayudan a que se note que se
            puede navegar) y solo al pasar el cursor en pantallas grandes.
          */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            <AnimatePresence initial={false}>
              {images.map((url, index) => (
                <motion.button
                  key={url}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`Go to image ${index + 1}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{
                    scale: index === selectedIndex ? 1.15 : 1,
                    opacity: 1,
                    width: index === selectedIndex ? 18 : 6,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`h-1.5 rounded-full ${
                    index === selectedIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
