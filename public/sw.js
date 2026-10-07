/*
 * Service worker de EcoGuide Training.
 *
 * Alcance deliberadamente acotado: hace la app instalable y muestra una
 * pantalla "Sin conexión" cuando no hay internet. NO cachea HTML ni
 * respuestas de la API (progreso, chatbot, sesión...): son datos por usuario
 * y cachearlos mostraría información desactualizada o de otra sesión. Solo
 * se cachean archivos estáticos propios (JS/CSS/fuentes versionados por
 * Next.js, íconos e imágenes del proyecto).
 *
 * Al cambiar este archivo, sube VERSION para limpiar las cachés anteriores.
 */
const VERSION = "v3";
const STATIC_CACHE = `ecoguide-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo.svg",
];

const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/avatars/", "/leaflet/", "/geo/"];
const STATIC_FILES = ["/logo.svg", "/logo.png", "/eco-avatar.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ecoguide-") && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    STATIC_FILES.includes(url.pathname) ||
    STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // La API, Cloudinary, tiles, etc. (otros orígenes) siempre van a la red.
  if (url.origin !== self.location.origin) return;

  // Navegaciones: siempre red; solo si falla (sin internet) mostramos la
  // pantalla offline. Nunca se cachea el HTML (depende de la sesión).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL);
        return cached ?? Response.error();
      }),
    );
    return;
  }

  if (!isStaticAsset(url)) return;

  // Estáticos: caché primero (los de /_next/static llevan hash en el nombre,
  // así que son inmutables); si no están, red y se guardan.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
