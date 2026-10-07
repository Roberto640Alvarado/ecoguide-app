import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

/**
 * Logo de EcoGuide en vector (public/logo.svg). Conserva siempre su
 * proporción (aspect-ratio + object-contain): se controla solo con la
 * altura (`h-*`) y el ancho sale solo, así que ya no se deforma ni se recorta
 * como cuando se forzaba a un cuadrado redondo. `shrink-0` evita que el flex
 * lo comprima (p. ej. al colapsar el sidebar).
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt=""
      aria-hidden="true"
      width={515}
      height={434}
      draggable={false}
      className={cn(
        "aspect-[515/434] w-auto shrink-0 select-none object-contain",
        className,
      )}
    />
  );
}

/** Nombre de marca: "Eco" en verde de marca + "Guide" en el color de texto. */
export function BrandWordmark({ className }: BrandLogoProps) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      <span className="text-accent">Eco</span>Guide
    </span>
  );
}
