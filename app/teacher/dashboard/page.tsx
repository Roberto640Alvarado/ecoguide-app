"use client";

import { motion } from "framer-motion";
import { Users, MapPinned, BookOpen, Cpu } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { UserAvatar } from "@/components/ui/user-avatar";

const cards = [
  {
    icon: Users,
    en: { title: "Students", description: "Manage student accounts and access." },
    es: { title: "Estudiantes", description: "Administra cuentas y accesos de estudiantes." },
  },
  {
    icon: MapPinned,
    en: { title: "Protected areas", description: "Create and edit protected areas content." },
    es: { title: "Áreas protegidas", description: "Crea y edita el contenido de las áreas protegidas." },
  },
  {
    icon: BookOpen,
    en: { title: "FlashCards", description: "Manage flashcards for each protected area." },
    es: { title: "FlashCards", description: "Administra las flashcards de cada área protegida." },
  },
  {
    icon: Cpu,
    en: { title: "AI Providers", description: "Configure AI providers, models and prompts." },
    es: { title: "Proveedores de IA", description: "Configura proveedores de IA, modelos y prompts." },
  },
];

export default function TeacherDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8"
      >
        <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
        <div>
          <p className="text-sm font-semibold text-accent">
            {language === "en" ? "Teacher panel" : "Panel de docente"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            {language === "en" ? "Welcome" : "Bienvenido"}
            {user ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            {language === "en"
              ? "This is an example of your future admin dashboard. Management tools will appear here as they become available."
              : "Este es un ejemplo de tu futuro panel administrativo. Las herramientas de gestión aparecerán aquí a medida que estén disponibles."}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const copy = card[language];
          return (
            <motion.div
              key={copy.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <span className="absolute right-4 top-4 rounded-full bg-default-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {language === "en" ? "Coming soon" : "Próximamente"}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {copy.title}
              </h3>
              <p className="text-sm text-muted">{copy.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
