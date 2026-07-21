"use client";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ProtectedArea } from "../types/protected-area.types";

/** Centro geográfico aproximado de El Salvador (mismo valor que ProtectedAreaForm). */
export const EL_SALVADOR_CENTER = { latitude: 13.7942, longitude: -88.8965 };

/**
 * Insignia circular verde con un ícono de hoja (en vez del pin por defecto
 * de Leaflet) para acercarse al estilo "mapa ilustrado" que pidió el
 * usuario. Se arma como divIcon (HTML plano) porque Leaflet no renderiza
 * componentes de React dentro de sus íconos.
 */
function buildAreaIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-accent text-white shadow-lg transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface ProtectedAreasMapProps {
  areas: ProtectedArea[];
}

/**
 * Mapa de solo lectura con un marcador por área protegida y su nombre
 * siempre visible al lado, como una ilustración fija en vez de un mapa
 * interactivo de exploración libre. El zoom queda fijo (más cercano que
 * antes, para que El Salvador se vea grande) y sin controles de zoom en
 * ningún tamaño de pantalla; el arrastre (dragging) solo se habilita por
 * debajo del breakpoint `lg` (móvil/tablet), donde a este zoom el país
 * completo no cabe en el ancho disponible y el estudiante necesita poder
 * moverse para ver los pines que quedan fuera de encuadre. Un clic en el
 * marcador o en su etiqueta lleva directo al detalle del área.
 */
export function ProtectedAreasMap({ areas }: ProtectedAreasMapProps) {
  const router = useRouter();
  const icon = buildAreaIcon();
  const isCompactViewport = useMediaQuery("(max-width: 1023px)");

  function goToArea(id: string) {
    router.push(`/student/protected-areas/${id}`);
  }

  return (
    <MapContainer
      center={[EL_SALVADOR_CENTER.latitude, EL_SALVADOR_CENTER.longitude]}
      zoom={9.3}
      zoomControl={false}
      dragging={isCompactViewport}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={false}
      className="h-72 w-full rounded-3xl border border-border sm:h-[26rem]"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {areas.map((area) => (
        <Marker
          key={area.id}
          position={[area.latitude, area.longitude]}
          icon={icon}
          eventHandlers={{ click: () => goToArea(area.id) }}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -18]}
            interactive
            className="area-map-tooltip"
            eventHandlers={{ click: () => goToArea(area.id) }}
          >
            {area.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
