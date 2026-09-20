import Image from "next/image";

interface EcoGuideAvatarProps {
  /** Lado del avatar en píxeles (siempre cuadrado). */
  size?: number;
  /** Clases extra para el tamaño en Tailwind (ej. "h-8 w-8"). */
  className?: string;
  priority?: boolean;
}

/**
 * Avatar circular de la mascota EcoGuía (`public/eco-avatar.png`), el mismo
 * personaje que ya se usa en la práctica de speaking y en la landing. Se
 * recorta con `object-top` para que se vea la cara y no el cuerpo completo.
 *
 * Vive en `components/ui` porque lo comparten varias features (chatbot,
 * speaking) — ver CLAUDE.md: "si dos features necesitan compartir algo, ese
 * algo sube a components/".
 */
export function EcoGuideAvatar({
  size = 32,
  className,
  priority,
}: EcoGuideAvatarProps) {
  return (
    <Image
      src="/eco-avatar.png"
      alt="EcoGuía"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 rounded-full border border-border bg-accent-soft object-cover object-top ${className ?? ""}`}
    />
  );
}
