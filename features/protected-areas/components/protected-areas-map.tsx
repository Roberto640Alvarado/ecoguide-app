"use client";

import L from "leaflet";
import type { Feature, GeoJsonObject } from "geojson";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AttributionControl,
  GeoJSON,
  MapContainer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ProtectedArea } from "../types/protected-area.types";
import { ProtectedAreaHoverCard } from "./protected-area-hover-card";

/** Centro geográfico aproximado de El Salvador (mismo valor que ProtectedAreaForm). */
export const EL_SALVADOR_CENTER = { latitude: 13.7942, longitude: -88.8965 };

/** Límites de El Salvador (sur-oeste / norte-este) a partir del GeoJSON. */
const EL_SALVADOR_BOUNDS = L.latLngBounds([13.14, -90.14], [14.46, -87.68]);

/** Departamentos de El Salvador (geoBoundaries, CC BY 4.0). */
const DEPARTMENTS_GEOJSON_URL = "/geo/el-salvador-departamentos.geojson";

/**
 * Tono (0-3) de cada departamento, calculado para que dos departamentos
 * vecinos nunca compartan tono (4 colores bastan). Ver `.area-map-department`.
 */
const DEPARTMENT_TONES: Record<string, number> = {
  Cuscatlán: 0,
  Usulután: 2,
  "La Libertad": 0,
  Ahuachapán: 0,
  Sonsonate: 2,
  "San Vicente": 1,
  "San Miguel": 0,
  "La Unión": 1,
  Morazán: 2,
  "La Paz": 2,
  "Santa Ana": 1,
  Chalatenango: 2,
  "San Salvador": 1,
  Cabañas: 3,
};

function getDepartmentName(feature?: Feature): string {
  const raw = (feature?.properties as { shapeName?: string } | null)?.shapeName;
  return (raw ?? "").replace(/^Departamento de /, "");
}

const MAP_ATTRIBUTION =
  'Límites: <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0)';

/**
 * Insignia circular verde con un ícono de hoja (en vez del pin por defecto
 * de Leaflet). Se arma como divIcon (HTML plano) porque Leaflet no renderiza
 * componentes de React dentro de sus íconos.
 */
function buildAreaIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div class="relative flex h-9 w-9 items-center justify-center">
        <span class="absolute inset-0 rounded-full bg-accent/30 motion-safe:animate-ping" style="animation-duration: 2.8s"></span>
        <div class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent text-white shadow-lg ring-4 ring-accent/20 transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface CountryViewportProps {
  /** true en móvil/tablet: permite arrastrar y hacer pinch-zoom. */
  interactive: boolean;
}

/**
 * Encuadra siempre El Salvador completo en el contenedor (también al
 * redimensionar), fija ese encuadre como zoom mínimo y limita el paneo a los
 * alrededores del país. `MapContainer` ignora cambios de props tras montar,
 * por eso la interactividad se activa/desactiva aquí con la API del mapa.
 */
function CountryViewport({ interactive }: CountryViewportProps) {
  const map = useMap();

  useEffect(() => {
    function fitCountry() {
      map.invalidateSize();
      map.setMinZoom(0);
      // Más margen abajo/arriba: ahí caben las etiquetas de los pines del
      // borde (ej. la bahía al sur) sin que las recorte el mapa.
      map.fitBounds(EL_SALVADOR_BOUNDS, {
        paddingTopLeft: [16, 40],
        paddingBottomRight: [16, 56],
        animate: false,
      });
      map.setMinZoom(map.getZoom());
      map.setMaxBounds(EL_SALVADOR_BOUNDS.pad(0.12));
    }

    fitCountry();
    const observer = new ResizeObserver(fitCountry);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (interactive) {
      map.dragging.enable();
      map.touchZoom.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
    }
  }, [map, interactive]);

  return null;
}

interface AreaHoverState {
  area: ProtectedArea;
  x: number;
  y: number;
  mapWidth: number;
  mapHeight: number;
}

interface AreaMarkerProps {
  area: ProtectedArea;
  icon: L.DivIcon;
  direction: "top" | "bottom";
  /** Solo con puntero fino (mouse): en táctil un toque ya navega al área. */
  canHover: boolean;
  onHoverStart: (state: AreaHoverState) => void;
  onHoverEnd: () => void;
  onOpen: (id: string) => void;
}

/**
 * Pin + etiqueta de un área. Vive dentro del MapContainer para poder usar
 * `useMap` y convertir su lat/lng a píxeles del contenedor, que es donde se
 * posiciona la tarjeta flotante.
 */
function AreaMarker({
  area,
  icon,
  direction,
  canHover,
  onHoverStart,
  onHoverEnd,
  onOpen,
}: AreaMarkerProps) {
  const map = useMap();

  return (
    <Marker
      position={[area.latitude, area.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onOpen(area.id),
        mouseover: () => {
          if (!canHover) return;
          const point = map.latLngToContainerPoint([area.latitude, area.longitude]);
          const size = map.getSize();
          onHoverStart({
            area,
            x: point.x,
            y: point.y,
            mapWidth: size.x,
            mapHeight: size.y,
          });
        },
        mouseout: onHoverEnd,
      }}
    >
      <Tooltip
        permanent
        direction={direction}
        offset={[0, direction === "top" ? -18 : 18]}
        interactive
        className="area-map-tooltip"
        eventHandlers={{ click: () => onOpen(area.id) }}
      >
        {area.name}
      </Tooltip>
    </Marker>
  );
}

interface ProtectedAreasMapProps {
  areas: ProtectedArea[];
}

/**
 * Mapa de solo lectura de El Salvador dibujado con GeoJSON (departamentos),
 * sin mapa base de calles: solo el país sobre el mar, con un pin por área
 * protegida y su nombre siempre visible. Las ubicaciones salen de la
 * latitud/longitud ya guardada en cada área, así que no cambian. Un clic en
 * el pin o en su etiqueta lleva al detalle del área.
 */
export function ProtectedAreasMap({ areas }: ProtectedAreasMapProps) {
  const router = useRouter();
  const icon = useMemo(() => buildAreaIcon(), []);
  const isCompactViewport = useMediaQuery("(max-width: 1023px)");
  const [departments, setDepartments] = useState<GeoJsonObject | null>(null);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [hover, setHover] = useState<AreaHoverState | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOverPinRef = useRef(false);
  const isOverCardRef = useRef(false);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Cierra solo si, al vencer la espera, el cursor ya no está ni sobre el pin
  // ni sobre la tarjeta. Comprobar el estado actual (en vez de depender del
  // orden en que llegan los eventos de salida/entrada) evita que el popover
  // se cierre al pasar del pin a la tarjeta.
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPinRef.current && !isOverCardRef.current) {
        setHover(null);
      }
    }, 250);
  }, [cancelClose]);

  const openHover = useCallback(
    (state: AreaHoverState) => {
      isOverPinRef.current = true;
      cancelClose();
      setHover(state);
    },
    [cancelClose],
  );

  const leavePin = useCallback(() => {
    isOverPinRef.current = false;
    scheduleClose();
  }, [scheduleClose]);

  const enterCard = useCallback(() => {
    isOverCardRef.current = true;
    cancelClose();
  }, [cancelClose]);

  const leaveCard = useCallback(() => {
    isOverCardRef.current = false;
    scheduleClose();
  }, [scheduleClose]);

  useEffect(() => cancelClose, [cancelClose]);

  // Precarga la foto principal de cada área para que la tarjeta no aparezca
  // vacía la primera vez que se pasa el cursor por un pin.
  useEffect(() => {
    areas.forEach((area) => {
      if (area.images[0]) {
        new window.Image().src = area.images[0];
      }
    });
  }, [areas]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(DEPARTMENTS_GEOJSON_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: GeoJsonObject | null) => setDepartments(data))
      .catch(() => setDepartments(null));

    return () => controller.abort();
  }, []);

  // Etiquetas alternadas arriba/abajo (ordenadas de oeste a este) para que
  // las de áreas vecinas no se encimen entre sí. Las de la costa sur van
  // siempre arriba: abajo se saldrían del mapa.
  const tooltipDirectionById = useMemo(() => {
    const byLongitude = [...areas].sort((a, b) => a.longitude - b.longitude);
    const directions = new Map<string, "top" | "bottom">();
    let flip = 0;

    byLongitude.forEach((area) => {
      if (area.latitude < 13.5) {
        directions.set(area.id, "top");
        return;
      }
      directions.set(area.id, flip % 2 === 0 ? "top" : "bottom");
      flip += 1;
    });

    return directions;
  }, [areas]);

  function goToArea(id: string) {
    router.push(`/student/protected-areas/${id}`);
  }

  return (
    <div className="relative">
      <MapContainer
        center={[EL_SALVADOR_CENTER.latitude, EL_SALVADOR_CENTER.longitude]}
        zoom={8}
        zoomSnap={0}
        maxZoom={11}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        className="area-map isolate h-72 w-full rounded-3xl border border-border sm:h-[26rem]"
      >
        <CountryViewport interactive={isCompactViewport} />
        <AttributionControl position="bottomright" prefix={false} />
        {departments && (
          <>
            {/* Halo de costa: contorno ancho y claro debajo del país. */}
            <GeoJSON
              data={departments}
              interactive={false}
              style={() => ({ className: "area-map-coast" })}
            />
            <GeoJSON
              key={String(canHover)}
              data={departments}
              attribution={MAP_ATTRIBUTION}
              style={(feature) => ({
                className: `area-map-department tone-${DEPARTMENT_TONES[getDepartmentName(feature)] ?? 0}`,
              })}
              onEachFeature={(feature, layer) => {
                if (!canHover) return;
                layer.bindTooltip(getDepartmentName(feature), {
                  sticky: true,
                  direction: "top",
                  offset: [0, -8],
                  className: "area-map-dept-tooltip",
                });
              }}
            />
          </>
        )}
        {areas.map((area) => (
          <AreaMarker
            key={area.id}
            area={area}
            icon={icon}
            direction={tooltipDirectionById.get(area.id) ?? "top"}
            canHover={canHover}
            onHoverStart={openHover}
            onHoverEnd={leavePin}
            onOpen={goToArea}
          />
        ))}
      </MapContainer>

      <AnimatePresence>
        {hover && (
          <ProtectedAreaHoverCard
            key={hover.area.id}
            area={hover.area}
            x={hover.x}
            y={hover.y}
            mapWidth={hover.mapWidth}
            mapHeight={hover.mapHeight}
            onEnter={enterCard}
            onLeave={leaveCard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
