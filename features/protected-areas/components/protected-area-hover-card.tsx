"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Images, MapPinned } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { ProtectedArea } from "../types/protected-area.types";

/** Ancho de la tarjeta (px). Debe coincidir con `w-72`. */
export const AREA_HOVER_CARD_WIDTH = 288;
/** Alto aproximado (px), solo para decidir si cabe arriba o abajo del pin. */
export const AREA_HOVER_CARD_HEIGHT_ESTIMATE = 290;

const MAX_THUMBNAILS = 4;
const AUTO_ADVANCE_MS = 2200;

interface ProtectedAreaHoverCardProps {
  area: ProtectedArea;
  /** Posición del pin dentro del contenedor del mapa (px). */
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
  /** La tarjeta es interactiva: se mantiene abierta mientras el cursor esté encima. */
  onEnter: () => void;
  onLeave: () => void;
}

/**
 * Popover que aparece al pasar el cursor sobre el pin de un área en
 * ProtectedAreasMap: foto principal que rota sola, miniaturas (al pasar el
 * cursor sobre una, se fija esa foto) y un acceso directo al área. Se pinta
 * como overlay HTML sobre el mapa (no como Popup de Leaflet) para poder
 * desbordar el contenedor redondeado del mapa y animarlo con Framer Motion.
 */
export function ProtectedAreaHoverCard({
  area,
  x,
  y,
  mapWidth,
  mapHeight,
  onEnter,
  onLeave,
}: ProtectedAreaHoverCardProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const shouldReduceMotion = useReducedMotion();

  const images = area.images;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);

  // Rota la foto principal mientras la tarjeta está abierta, salvo que la
  // persona ya haya elegido una miniatura a mano o prefiera menos movimiento.
  useEffect(() => {
    if (images.length < 2 || isManual || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [images.length, isManual, shouldReduceMotion]);

  const fitsAbove = y > AREA_HOVER_CARD_HEIGHT_ESTIMATE + 28;
  const left = Math.min(
    Math.max(x - AREA_HOVER_CARD_WIDTH / 2, 8),
    Math.max(mapWidth - AREA_HOVER_CARD_WIDTH - 8, 8),
  );
  const arrowLeft = Math.min(
    Math.max(x - left, 20),
    AREA_HOVER_CARD_WIDTH - 20,
  );

  const thumbnails = images.slice(0, MAX_THUMBNAILS);
  const hiddenCount = images.length - thumbnails.length;

  return (
    // Eventos de *mouse* (no de pointer) a propósito: el navegador despacha
    // primero todos los eventos pointer y después los mouse, y Leaflet cierra
    // con `mouseout` del pin. Con pointerenter la entrada a la tarjeta se
    // registraba ANTES de ese mouseout y el cierre programado ganaba.
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={
        fitsAbove
          ? { left, bottom: mapHeight - y + 16, width: AREA_HOVER_CARD_WIDTH }
          : { left, top: y + 16, width: AREA_HOVER_CARD_WIDTH }
      }
      // El padding transparente hace de "puente" entre el pin y la tarjeta
      // para que el cursor pueda subir a ella sin que se cierre.
      className={`absolute z-20 ${fitsAbove ? "pb-3" : "pt-3"}`}
    >
      <motion.div
        initial={{ opacity: 0, y: fitsAbove ? 8 : -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: fitsAbove ? 6 : -6, scale: 0.97 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" }}
        style={{ transformOrigin: `${arrowLeft}px ${fitsAbove ? "100%" : "0%"}` }}
        className="relative"
      >
        <Link
          href={`/student/protected-areas/${area.id}`}
          className="block overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        >
          <div className="relative h-40 w-full bg-accent-soft">
            {images.length > 0 ? (
              <AnimatePresence initial={false}>
                <motion.img
                  key={activeIndex}
                  src={images[activeIndex]}
                  alt={area.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MapPinned
                  className="h-8 w-8 text-accent-soft-foreground"
                  aria-hidden="true"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {images.length > 1 && (
              <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                <Images className="h-3 w-3" aria-hidden="true" />
                {activeIndex + 1}/{images.length}
              </span>
            )}

            <h3 className="absolute inset-x-3 bottom-2.5 line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow">
              {area.name}
            </h3>
          </div>

          {thumbnails.length > 1 && (
            <div className="grid grid-cols-4 gap-1.5 px-2.5 pt-2.5">
              {thumbnails.map((src, index) => (
                <span
                  key={src}
                  onPointerEnter={() => {
                    setIsManual(true);
                    setActiveIndex(index);
                  }}
                  className={`relative block h-12 overflow-hidden rounded-lg border-2 transition-all ${
                    index === activeIndex
                      ? "border-accent opacity-100"
                      : "border-transparent opacity-65 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                  />
                  {hiddenCount > 0 && index === thumbnails.length - 1 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-semibold text-white">
                      +{hiddenCount}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-accent">
            <span>{en ? "Explore this area" : "Explorar esta área"}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </Link>

        <span
          aria-hidden="true"
          style={{ left: arrowLeft - 6 }}
          className={`absolute h-3 w-3 rotate-45 border-border bg-surface ${
            fitsAbove
              ? "-bottom-1.5 border-b border-r"
              : "-top-1.5 border-l border-t"
          }`}
        />
      </motion.div>
    </div>
  );
}
