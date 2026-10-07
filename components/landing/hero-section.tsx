"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  ChevronDown,
  MapPinned,
  MessagesSquare,
  Mic,
} from "lucide-react";
import { buttonVariants } from "@heroui/styles";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";
import { MagneticWrapper } from "./magnetic-wrapper";
import { TypewriterText } from "./typewriter-text";

// Chips flotantes que "orbitan" el contenido del hero, uno por función
// principal de la plataforma (chatbot, áreas protegidas, speaking, badges).
// Cada uno flota en bucle infinito y además reacciona al cursor con un
// leve parallax (profundidad distinta por chip, para dar sensación de 3D).
const ORBIT_ICONS: Array<{
  icon: LucideIcon;
  className: string;
  depthX: number;
  depthY: number;
  duration: number;
}> = [
  { icon: MessagesSquare, className: "left-[4%] top-[16%]", depthX: 10, depthY: 8, duration: 8 },
  { icon: MapPinned, className: "right-[4%] top-[10%]", depthX: -12, depthY: 10, duration: 10 },
  { icon: Mic, className: "left-[7%] bottom-[18%]", depthX: 8, depthY: -10, duration: 9 },
  { icon: Award, className: "right-[6%] bottom-[14%]", depthX: -10, depthY: -8, duration: 11 },
];

function OrbitIcon({
  icon: Icon,
  className,
  depthX,
  depthY,
  duration,
  springX,
  springY,
}: {
  icon: LucideIcon;
  className: string;
  depthX: number;
  depthY: number;
  duration: number;
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
}) {
  const parallaxX = useTransform(springX, [-0.5, 0.5], [depthX, -depthX]);
  const parallaxY = useTransform(springY, [-0.5, 0.5], [depthY, -depthY]);

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 hidden lg:block ${className}`}
      style={{ x: parallaxX, y: parallaxY }}
    >
      <motion.div
        className="rounded-2xl border border-border bg-card/90 p-3 shadow-lg backdrop-blur-sm"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].hero;

  // Posición del cursor normalizada (-0.5..0.5) que alimenta el parallax de
  // los chips flotantes.
  const mouseXNorm = useMotionValue(0);
  const mouseYNorm = useMotionValue(0);
  const springXN = useSpring(mouseXNorm, { stiffness: 100, damping: 22 });
  const springYN = useSpring(mouseYNorm, { stiffness: 100, damping: 22 });

  // Se normaliza contra el viewport (no contra el rect de la sección): al
  // hacer scroll el navegador dispara un mousemove sintético y, con el rect,
  // la posición "cambiaba" aunque el cursor no se moviera, moviendo los chips.
  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    mouseXNorm.set(event.clientX / window.innerWidth - 0.5);
    mouseYNorm.set(event.clientY / window.innerHeight - 0.5);
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative isolate overflow-hidden"
    >
      {/* Foto de fondo (volcán de Santa Ana) + velo oscuro que se funde con
          el fondo de la página al final, para que el texto blanco se lea
          igual en modo claro y oscuro. */}
      {/* Capa propia en GPU (transform-gpu): evita que el navegador vuelva a
          rasterizar la foto cada vez que el navbar de cristal cambia de tono. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 transform-gpu">
        <Image
          src="/hero-izalco.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/45 to-background"
      />

      {ORBIT_ICONS.map((chip) => (
        <OrbitIcon
          key={chip.className}
          icon={chip.icon}
          className={chip.className}
          depthX={chip.depthX}
          depthY={chip.depthY}
          duration={chip.duration}
          springX={springXN}
          springY={springYN}
        />
      ))}

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-24 pt-32 text-center sm:px-6 lg:px-8 lg:pb-32 lg:pt-40">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm sm:text-sm"
        >
          {t.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl"
        >
          <TypewriterText
            text={t.title}
            delay={450}
            speed={26}
            className="block"
            reserveSpace
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="max-w-2xl text-base text-white/85 drop-shadow sm:text-lg"
        >
          {t.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          <MagneticWrapper>
            <Link
              href="/register"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </MagneticWrapper>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-6 text-white/70"
          aria-hidden="true"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </div>
    </section>
  );
}
