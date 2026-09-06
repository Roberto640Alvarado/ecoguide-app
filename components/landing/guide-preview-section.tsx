"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Send, Sparkles, Zap } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";
import { TypewriterText } from "./typewriter-text";

interface GuideBubbleProps {
  text: string;
  delay: number;
  active: boolean;
}

// Burbuja de Eco: tras un período de "escribiendo..." (los 3 puntitos, como
// anticipación), el texto se escribe letra por letra de verdad con
// TypewriterText.
function GuideBubble({ text, delay, active }: GuideBubbleProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={
        active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12 }
      }
      transition={{ duration: 0.35, delay: (delay - 250) / 1000 }}
      className="relative min-h-11 w-fit max-w-[85%] rounded-2xl rounded-tl-sm bg-accent-soft px-4 py-2.5 text-sm text-accent-soft-foreground shadow-sm"
    >
      {started ? (
        <TypewriterText text={text} speed={24} />
      ) : (
        <span className="flex items-center gap-1 py-0.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-accent-soft-foreground/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: dot * 0.15,
              }}
            />
          ))}
        </span>
      )}
    </motion.div>
  );
}

// Burbuja del estudiante (demo): ya "escrita" — a diferencia de las de Eco,
// no se anima letra por letra (representa un mensaje que el usuario ya
// envió), solo entra con fade + slide desde la derecha.
function StudentBubble({
  text,
  delay,
  active,
}: {
  text: string;
  delay: number;
  active: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
      transition={{ duration: 0.35, delay: delay / 1000 }}
      className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-accent-foreground shadow-sm"
    >
      {text}
    </motion.div>
  );
}

export function GuidePreviewSection() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].guide;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10"
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent-soft blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-info/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:items-center lg:gap-10">
          {/* Columna izquierda: presentación de Eco */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 -z-10 rounded-full bg-accent-soft blur-2xl" />
              <Image
                src="/eco-avatar.png"
                alt={t.name}
                width={144}
                height={144}
                className="h-28 w-28 rounded-full border-4 border-surface object-cover object-top shadow-lg sm:h-32 sm:w-32"
                priority
              />
              <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-success">
                <motion.span
                  aria-hidden="true"
                  className="absolute h-5 w-5 rounded-full bg-success"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative h-2 w-2 rounded-full bg-success-foreground" />
              </span>
            </motion.div>

            <div>
              <span className="text-sm font-semibold text-foreground">
                {t.name} ·{" "}
                {language === "en" ? "Your tour guide" : "Tu guía turístico"}
              </span>
              <p className="mt-2 text-sm text-muted">{t.tagline}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-3 py-1 text-xs font-medium text-info">
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                {t.badgeAvailable}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-soft-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t.badgeFeedback}
              </span>
            </div>
          </div>

          {/* Columna derecha: mockup de la ventana de chat */}
          <div className="overflow-hidden rounded-2xl border border-border bg-background/60 shadow-inner">
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
              <Image
                src="/eco-avatar.png"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
                className="h-7 w-7 rounded-full object-cover object-top"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-foreground">
                  {t.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  {language === "en" ? "Online" : "En línea"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 px-4 py-4">
              <GuideBubble text={t.greeting} delay={500} active={isInView} />
              <GuideBubble text={t.question} delay={1500} active={isInView} />
              <StudentBubble text={t.userExample} delay={2900} active={isInView} />
              <GuideBubble text={t.answerExample} delay={3500} active={isInView} />
            </div>

            <div
              aria-hidden="true"
              className="flex items-center gap-2 border-t border-border px-4 py-3"
            >
              <span className="flex-1 truncate rounded-full border border-border bg-surface px-4 py-2 text-xs text-muted">
                {t.inputPlaceholder}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
