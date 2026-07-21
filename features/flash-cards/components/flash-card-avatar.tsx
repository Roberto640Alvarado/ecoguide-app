"use client";

import { useEffect, useState } from "react";
import { FLASH_CARD_TYPE_AVATAR, type FlashCardType } from "../types/flash-card.types";

interface FlashCardAvatarProps {
  type: FlashCardType;
  className?: string;
}

/**
 * Gesto del mascota EcoGuide correspondiente a la categoría. Usa <img>
 * plano (no next/image) con onError para ocultarse por completo si el
 * archivo todavía no fue colocado en public/avatars/ — así el resto de la
 * UI (formulario, tabla) no se rompe ni muestra un ícono roto mientras las
 * imágenes no estén disponibles.
 */
export function FlashCardAvatar({ type, className }: FlashCardAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const src = FLASH_CARD_TYPE_AVATAR[type];

  // Si `type` cambia (ej. el maestro elige otra categoría en el
  // selector), hay que reintentar con la nueva imagen en vez de seguir
  // ocultando el componente por el error de la anterior.
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
