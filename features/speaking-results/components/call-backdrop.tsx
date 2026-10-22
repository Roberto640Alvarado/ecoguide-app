import Image from "next/image";

/**
 * Fondo de la llamada: el avatar desenfocado detrás (como una videollamada
 * sin cámara) más halos de la paleta. Usa tokens del tema, así que es
 * claro en tema claro y oscuro (Ink Black) en tema oscuro.
 */
export function CallBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <Image
        src="/eco-avatar.png"
        alt=""
        fill
        sizes="100vw"
        className="scale-125 object-cover object-top opacity-[0.12] blur-3xl dark:opacity-30"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklab,var(--info)_18%,transparent),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/85" />
    </div>
  );
}
