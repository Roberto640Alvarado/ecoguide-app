"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Award, MapPinned, MessagesSquare, UserPlus } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";

const icons: LucideIcon[] = [UserPlus, MapPinned, MessagesSquare, Award];

// Sección nueva: explica el recorrido real de la app paso a paso
// (registro → elegir área protegida → practicar con chatbot/quizzes/
// speaking → progreso e insignias). En desktop los 4 pasos se conectan
// con una línea horizontal que se "dibuja" (scaleX) al entrar en vista;
// en mobile se apilan verticalmente.
export function HowItWorksSection() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].howItWorks;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t.heading}
        </h2>
        <p className="mt-3 text-sm text-muted sm:text-base">{t.subheading}</p>
      </motion.div>

      <div className="relative">
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ originX: 0 }}
          className="absolute left-0 right-0 top-7 hidden h-px bg-border lg:block"
        />

        <div className="grid gap-10 lg:grid-cols-4 lg:gap-6">
          {t.steps.map((step, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative flex flex-col items-center gap-4 text-center lg:items-start lg:text-left"
              >
                <motion.span
                  whileHover={{ scale: 1.08 }}
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-surface text-accent shadow-sm"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                    {index + 1}
                  </span>
                </motion.span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
