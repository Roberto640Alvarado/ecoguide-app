"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  FilePlus2,
  MapPinned,
  PlusCircle,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUsers } from "@/features/users/hooks/use-users";
import { useProtectedAreas } from "@/features/protected-areas/hooks/use-protected-areas";
import { useAIProviders } from "@/features/ai-providers/hooks/use-ai-providers";

interface StatCardProps {
  icon: typeof Users;
  label: string;
  value: string | number;
  accent: "accent" | "success" | "warning" | "default";
  delay: number;
}

const ACCENT_CLASSES: Record<StatCardProps["accent"], string> = {
  accent: "bg-accent-soft text-accent-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  default: "bg-default-soft text-muted",
};

function StatCard({ icon: Icon, label, value, accent, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENT_CLASSES[accent]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight text-foreground">
          {value}
        </p>
        <p className="truncate text-xs text-muted">{label}</p>
      </div>
    </motion.div>
  );
}

const QUICK_ACTIONS = [
  {
    icon: Users,
    href: "/teacher/users",
    en: { title: "Students", description: "Manage student accounts and access." },
    es: { title: "Estudiantes", description: "Administra cuentas y accesos de estudiantes." },
  },
  {
    icon: MapPinned,
    href: "/teacher/protected-areas",
    en: { title: "Protected areas", description: "Create and edit protected areas content." },
    es: { title: "Áreas protegidas", description: "Crea y edita el contenido de las áreas protegidas." },
  },
  {
    icon: Cpu,
    href: "/teacher/ai-providers",
    en: { title: "AI Providers", description: "Configure AI providers, models and prompts." },
    es: { title: "Proveedores de IA", description: "Configura proveedores de IA, modelos y prompts." },
  },
  {
    icon: PlusCircle,
    href: "/teacher/protected-areas/new",
    en: { title: "New protected area", description: "Publish a new area for students to explore." },
    es: { title: "Nueva área protegida", description: "Publica una nueva área para tus estudiantes." },
  },
];

export default function TeacherDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  const { data: studentsData, isLoading: isStudentsLoading } = useUsers({
    role: "STUDENT",
    limit: 5,
    sort: "createdAt:desc",
  });
  const { data: publishedAreasData, isLoading: isPublishedLoading } =
    useProtectedAreas({ isPublished: true, limit: 1 });
  const { data: draftAreasData, isLoading: isDraftLoading } =
    useProtectedAreas({ isPublished: false, limit: 5, sort: "createdAt:desc" });
  const { data: aiProvidersData, isLoading: isProvidersLoading } =
    useAIProviders({ isActive: true, limit: 1 });

  const studentsTotal = studentsData?.meta.total ?? 0;
  const publishedTotal = publishedAreasData?.meta.total ?? 0;
  const draftItems = draftAreasData?.items ?? [];
  const draftTotal = draftAreasData?.meta.total ?? 0;
  const activeProvidersTotal = aiProvidersData?.meta.total ?? 0;
  const recentStudents = studentsData?.items ?? [];

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
            {en ? "Teacher panel" : "Panel de docente"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            {en ? "Welcome" : "Bienvenido"}
            {user ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            {en
              ? "Here's what's happening across your students and content."
              : "Esto es lo que está pasando con tus estudiantes y tu contenido."}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Users}
          label={en ? "Students" : "Estudiantes"}
          value={isStudentsLoading ? "…" : studentsTotal}
          accent="accent"
          delay={0.05}
        />
        <StatCard
          icon={MapPinned}
          label={en ? "Published areas" : "Áreas publicadas"}
          value={isPublishedLoading ? "…" : publishedTotal}
          accent="success"
          delay={0.1}
        />
        <StatCard
          icon={FilePlus2}
          label={en ? "Drafts pending" : "Borradores pendientes"}
          value={isDraftLoading ? "…" : draftTotal}
          accent="warning"
          delay={0.15}
        />
        <StatCard
          icon={Cpu}
          label={en ? "Active AI providers" : "Proveedores de IA activos"}
          value={isProvidersLoading ? "…" : activeProvidersTotal}
          accent="default"
          delay={0.2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {en ? "Recent students" : "Estudiantes recientes"}
            </h2>
            <Link
              href="/teacher/users"
              className="text-sm font-medium text-accent hover:underline"
            >
              {en ? "See all" : "Ver todos"}
            </Link>
          </div>

          {recentStudents.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border">
              {recentStudents.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/teacher/users/${student.id}/progress`}
                    className="flex items-center gap-3 rounded-lg py-2.5 transition-colors hover:bg-layer-hover"
                  >
                    <UserAvatar
                      name={student.name}
                      avatarUrl={student.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {student.name} {student.lastName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {student.email}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : !isStudentsLoading ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-secondary/30 p-4 text-center text-sm text-muted">
              {en ? "No students registered yet." : "Todavía no hay estudiantes registrados."}
            </p>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              {en ? "Drafts pending publish" : "Borradores por publicar"}
            </h2>
            <Link
              href="/teacher/protected-areas"
              className="text-sm font-medium text-accent hover:underline"
            >
              {en ? "See all" : "Ver todas"}
            </Link>
          </div>

          {draftItems.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border">
              {draftItems.map((area) => (
                <li key={area.id}>
                  <Link
                    href={`/teacher/protected-areas/${area.id}/edit`}
                    className="flex items-center gap-3 rounded-lg py-2.5 transition-colors hover:bg-layer-hover"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning-soft-foreground">
                      <MapPinned className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {area.name}
                      </p>
                      <p className="text-xs text-muted">
                        {en ? "Draft" : "Borrador"}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : !isDraftLoading ? (
            <p className="rounded-xl border border-dashed border-border bg-surface-secondary/30 p-4 text-center text-sm text-muted">
              {en
                ? "All protected areas are published."
                : "Todas las áreas protegidas están publicadas."}
            </p>
          ) : null}
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {en ? "Quick actions" : "Accesos rápidos"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            const copy = action[language];
            return (
              <motion.div
                key={copy.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + index * 0.06 }}
              >
                <Link
                  href={action.href}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-layer-hover"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {copy.title}
                  </h3>
                  <p className="text-sm text-muted">{copy.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
