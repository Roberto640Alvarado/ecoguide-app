"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { MessagesSquare, MapPinned, Mic, Zap } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";

const icons: LucideIcon[] = [MessagesSquare, MapPinned, Mic, Zap];

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  live?: boolean;
}

// Cada tarjeta tiene un "spotlight" que sigue al cursor (radial-gradient
// posicionado con la coordenada del mouse relativa a la tarjeta) además del
// levantamiento y el ícono que gira/escala al hacer hover. La tarjeta de
// retroalimentación en tiempo real (`live`) además tiene un anillo que
// pulsa detrás del ícono, para reforzar la idea de "en vivo".
function FeatureCard({ icon: Icon, title, description, index, live }: FeatureCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, var(--accent-soft, rgba(9,129,74,0.25)), transparent 75%)`;

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-lg"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
        {live && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-xl bg-accent-soft"
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <Icon className="relative h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="relative text-lg font-semibold text-foreground">{title}</h3>
      <p className="relative text-sm text-muted">{description}</p>
    </motion.article>
  );
}

export function FeaturesSection() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].features;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center text-2xl font-bold text-foreground sm:text-3xl"
      >
        {t.heading}
      </motion.h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={icons[index]}
            title={feature.title}
            description={feature.description}
            index={index}
            live={index === t.items.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
