"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
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

  // Spotlight que sigue al cursor dentro de la sección (posición en px), y
  // una versión normalizada (-0.5..0.5) que alimenta el parallax de los
  // chips flotantes.
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const mouseXNorm = useMotionValue(0);
  const mouseYNorm = useMotionValue(0);
  const springXN = useSpring(mouseXNorm, { stiffness: 100, damping: 22 });
  const springYN = useSpring(mouseYNorm, { stiffness: 100, damping: 22 });
  const spotlightBackground = useMotionTemplate`radial-gradient(500px circle at ${spotlightX}px ${spotlightY}px, var(--accent-soft, rgba(9,129,74,0.16)), transparent 70%)`;

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    spotlightX.set(x);
    spotlightY.set(y);
    mouseXNorm.set(x / rect.width - 0.5);
    mouseYNorm.set(y / rect.height - 0.5);
  }

  return (
    <section onMouseMove={handleMouseMove} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--accent-soft,rgba(34,153,84,0.12)),_transparent_60%)]"
        aria-hidden="true"
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: spotlightBackground }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-40 -z-10 h-64 w-64 rounded-full bg-accent-soft blur-3xl"
        animate={{ y: [0, -16, 0], x: [0, -10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Anillos punteados decorativos ("orbit"), detrás del contenido */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/25 lg:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-info/25 lg:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
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

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-full bg-accent-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-soft-foreground sm:text-sm"
        >
          {t.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          <TypewriterText text={t.title} delay={450} speed={26} />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="max-w-2xl text-base text-muted sm:text-lg"
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
          className="mt-6 text-muted"
          aria-hidden="true"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </div>
    </section>
  );
}
