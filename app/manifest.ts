import type { MetadataRoute } from "next";

/**
 * Web App Manifest de EcoGuide Training (PWA). `start_url: "/login"` es
 * intencional: el middleware ya redirige al dashboard del rol si hay sesión
 * activa, así que la app instalada abre directo en el panel del usuario y,
 * sin sesión, en el login.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "EcoGuide Training",
    short_name: "EcoGuide",
    description:
      "Practica inglés aplicado al ecoturismo en las áreas protegidas de El Salvador.",
    lang: "es",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdfffc", // Porcelain
    theme_color: "#09814a", // Sea Green
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
