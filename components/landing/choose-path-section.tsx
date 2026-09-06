"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, GraduationCap, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";
import { MagneticWrapper } from "./magnetic-wrapper";

interface PathCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  accent: "accent" | "info";
  delay: number;
  /** Nota informativa bajo el CTA (docente: "tu administrador crea tu cuenta"). */
  footnote?: string;
  /** Link secundario bajo el CTA (estudiante: "¿ya tienes cuenta? inicia sesión") —
   *  sin esto, la tarjeta de estudiante solo ofrecía registrarse, y quien ya
   *  tiene cuenta no tenía a dónde ir desde aquí (reportado por el usuario:
   *  "tienen el mismo inicio de sesión", ambos caminos terminaban en el
   *  mismo /login sin ninguna entrada visible desde el lado estudiante). */
  secondaryCta?: string;
  secondaryHref?: string;
}

// Tarjeta oscura con inclinación 3D hacia el cursor (rotateX/rotateY con
// spring) y un resplandor de color que sigue al puntero — inspirado en el
// patrón "Choose Your Adventure" de la referencia, con los colores y el
// contenido propios de EcoGuide. A propósito se mantiene oscura en ambos
// temas (claro/oscuro) como acento deliberado, igual que en la
// referencia — la SECCIÓN que la envuelve no fuerza un fondo negro de
// pared a pared; usa el mismo fondo que el resto de la página (ver
// ChoosePathSection) para que la transición entre secciones no se sienta
// abrupta.
function PathCard({
  icon: Icon,
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  accent,
  delay,
  footnote,
  secondaryCta,
  secondaryHref,
}: PathCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowColor =
    accent === "accent" ? "rgba(9,129,74,0.4)" : "rgba(109,157,197,0.4)";
  const glow = useMotionTemplate`radial-gradient(280px circle at ${glowX}% ${glowY}%, ${glowColor}, transparent 70%)`;

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 10);
    rotateX.set((0.5 - py) * 10);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      className="relative flex flex-1 flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0f2820] p-8 text-white shadow-xl shadow-black/20"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: glow }}
      />

      <div className="relative flex items-center gap-3">
        <motion.span
          whileHover={{ rotate: 8, scale: 1.08 }}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accent === "accent" ? "bg-accent/20 text-accent" : "bg-info/20 text-info",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </motion.span>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      <p className="relative text-sm text-white/70">{description}</p>

      <ul className="relative flex flex-1 flex-col gap-2.5">
        {bullets.map((bullet, index) => (
          <motion.li
            key={bullet}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.35, delay: delay + 0.15 + index * 0.08 }}
            className="flex items-start gap-2 text-sm text-white/85"
          >
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                accent === "accent" ? "text-accent" : "text-info",
              )}
              aria-hidden="true"
            />
            {bullet}
          </motion.li>
        ))}
      </ul>

      <div className="relative flex flex-col items-start gap-2">
        <MagneticWrapper className="block">
          <Link
            href={ctaHref}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:w-auto",
              accent === "accent"
                ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                : "bg-info text-info-foreground hover:opacity-90",
            )}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </MagneticWrapper>

        {secondaryCta && secondaryHref && (
          <Link
            href={secondaryHref}
            className="text-xs font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {secondaryCta}
          </Link>
        )}

        {footnote && <p className="text-xs text-white/50">{footnote}</p>}
      </div>
    </motion.div>
  );
}

export function ChoosePathSection() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].choosePath;

  return (
    <section className="relative overflow-hidden py-20">
      {/* Mismos blobs difuminados del hero, para que esta sección se sienta
          parte del mismo lenguaje visual en vez de un bloque aparte — el
          fondo de la sección sigue siendo el de la página (bg-background,
          heredado del body), solo las dos tarjetas son oscuras a propósito. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-0 -z-10 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
        animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t.heading}
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            {t.subheading}
          </p>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <PathCard
            icon={GraduationCap}
            title={t.student.title}
            description={t.student.description}
            bullets={t.student.bullets}
            ctaLabel={t.student.cta}
            ctaHref="/register"
            accent="accent"
            delay={0}
            secondaryCta={t.student.secondaryCta}
            secondaryHref={t.student.secondaryHref}
          />
          <PathCard
            icon={UsersRound}
            title={t.teacher.title}
            description={t.teacher.description}
            bullets={t.teacher.bullets}
            ctaLabel={t.teacher.cta}
            ctaHref="/login"
            accent="info"
            delay={0.12}
            footnote={t.teacher.footnote}
          />
        </div>
      </div>
    </section>
  );
}
