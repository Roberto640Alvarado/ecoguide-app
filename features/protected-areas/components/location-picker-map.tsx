"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

/**
 * Los íconos por defecto de Leaflet referencian assets vía rutas relativas
 * que la mayoría de bundlers (incluido Turbopack) no resuelven
 * automáticamente. Se apunta a las copias servidas por `public/leaflet/`
 * (copiadas desde `node_modules/leaflet/dist/images/`) en vez de depender
 * de un CDN externo.
 */
const markerIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ClickHandlerProps {
  onLocationChange: (latitude: number, longitude: number) => void;
}

function ClickHandler({ onLocationChange }: ClickHandlerProps) {
  useMapEvents({
    click(event) {
      onLocationChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={9}
      scrollWheelZoom
      className="h-80 w-full rounded-2xl border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onLocationChange={onLocationChange} />
      <Marker
        position={[latitude, longitude]}
        icon={markerIcon}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const position = event.target.getLatLng();
            onLocationChange(position.lat, position.lng);
          },
        }}
      />
    </MapContainer>
  );
}
