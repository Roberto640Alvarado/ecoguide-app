"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";

interface ChatBubbleProps {
  text: string;
  delay: number;
  active: boolean;
}

function ChatBubble({ text, delay, active }: ChatBubbleProps) {
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setIsTyping(false), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={
        active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12 }
      }
      transition={{ duration: 0.35, delay: (delay - 250) / 1000 }}
      className="relative w-fit max-w-xs rounded-2xl rounded-tl-sm bg-accent-soft px-4 py-3 text-sm text-accent-soft-foreground shadow-sm sm:max-w-sm sm:text-base"
    >
      {isTyping ? (
        <span className="flex items-center gap-1 py-0.5">
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
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );
}

export function GuidePreviewSection() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].guide;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
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

        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 -z-10 rounded-full bg-accent-soft blur-2xl" />
            <Image
              src="/eco-avatar.png"
              alt={t.name}
              width={160}
              height={160}
              className="h-36 w-36 rounded-full border-4 border-surface object-cover object-top shadow-lg sm:h-40 sm:w-40"
              priority
            />
            <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-success">
              <span className="h-2 w-2 rounded-full bg-success-foreground" />
            </span>
          </motion.div>

          <div className="flex flex-1 flex-col gap-3">
            <span className="text-sm font-semibold text-muted">
              {t.name} · {language === "en" ? "Your tour guide" : "Tu guía turístico"}
            </span>

            <ChatBubble text={t.greeting} delay={600} active={isInView} />
            <div className="h-1" />
            <ChatBubble text={t.question} delay={1800} active={isInView} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
