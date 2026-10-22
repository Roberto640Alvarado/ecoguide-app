import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las insignias pueden ser SVG (subidas a Cloudinary). next/image
    // rechaza SVG por defecto; se permiten sin optimizar y con una CSP que
    // bloquea cualquier script embebido en el archivo.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // El service worker nunca debe quedar en la caché HTTP, para que las
        // actualizaciones lleguen a los usuarios en la siguiente visita.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
