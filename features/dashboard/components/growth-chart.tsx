"use client";

import { useMemo, useState } from "react";
import { format, startOfMonth, subMonths } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useUsers } from "@/features/users/hooks/use-users";
import { useProtectedAreas } from "@/features/protected-areas/hooks/use-protected-areas";

/**
 * Único gráfico del panel de docente: nuevos estudiantes y áreas
 * protegidas creadas por mes. Se calcula 100% en el cliente a partir de
 * las mismas listas paginadas que ya usa el resto del dashboard (no hay
 * ningún endpoint de agregados/series de tiempo en el backend) — se pide
 * el máximo permitido por la API (`limit: 100`, ver PaginationQueryDto)
 * ordenado por fecha de creación y se agrupa por mes en el cliente.
 *
 * Interactividad: selector de rango (6/12 meses), tooltip al pasar el
 * mouse por una barra, y leyenda clicable para mostrar/ocultar cada
 * serie (patrón estándar de Recharts vía estado local `visible`).
 */

const RANGE_OPTIONS = [6, 12] as const;
type RangeMonths = (typeof RANGE_OPTIONS)[number];

interface SeriesVisibility {
  students: boolean;
  areas: boolean;
}

interface MonthBucket {
  key: string;
  label: string;
  students: number;
  areas: number;
}

function monthBucketKey(iso: string): string {
  return format(startOfMonth(new Date(iso)), "yyyy-MM");
}

function CustomTooltip({
  active,
  payload,
  label,
  studentsLabel,
  areasLabel,
}: TooltipContentProps & {
  studentsLabel: string;
  areasLabel: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const students = payload.find((entry) => entry.dataKey === "students")?.value ?? 0;
  const areas = payload.find((entry) => entry.dataKey === "areas")?.value ?? 0;

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="flex items-center gap-2 text-muted">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        {studentsLabel}: <span className="font-medium text-foreground">{students}</span>
      </p>
      <p className="flex items-center gap-2 text-muted">
        <span className="h-2 w-2 rounded-full bg-info" aria-hidden="true" />
        {areasLabel}: <span className="font-medium text-foreground">{areas}</span>
      </p>
    </div>
  );
}

export function GrowthChart() {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const locale = en ? enUS : es;

  const [range, setRange] = useState<RangeMonths>(6);
  const [visible, setVisible] = useState<SeriesVisibility>({
    students: true,
    areas: true,
  });

  const { data: studentsData, isLoading: isStudentsLoading } = useUsers({
    role: "STUDENT",
    limit: 100,
    sort: "createdAt:asc",
  });
  const { data: areasData, isLoading: isAreasLoading } = useProtectedAreas({
    limit: 100,
    sort: "createdAt:asc",
  });

  const isLoading = isStudentsLoading || isAreasLoading;
  const studentsLabel = en ? "New students" : "Estudiantes nuevos";
  const areasLabel = en ? "Areas created" : "Áreas creadas";

  const chartData = useMemo<MonthBucket[]>(() => {
    const now = new Date();
    const months: MonthBucket[] = Array.from({ length: range }, (_, index) => {
      const monthDate = startOfMonth(subMonths(now, range - 1 - index));
      return {
        key: format(monthDate, "yyyy-MM"),
        label: format(monthDate, "MMM", { locale }),
        students: 0,
        areas: 0,
      };
    });

    const byKey = new Map(months.map((month) => [month.key, month]));

    for (const student of studentsData?.items ?? []) {
      const bucket = byKey.get(monthBucketKey(student.createdAt));
      if (bucket) {
        bucket.students += 1;
      }
    }

    for (const area of areasData?.items ?? []) {
      const bucket = byKey.get(monthBucketKey(area.createdAt));
      if (bucket) {
        bucket.areas += 1;
      }
    }

    return months;
  }, [studentsData, areasData, range, locale]);

  function toggleSeries(dataKey: unknown) {
    if (dataKey === "students" || dataKey === "areas") {
      setVisible((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22 }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {en ? "Growth" : "Crecimiento"}
            </h2>
            <p className="text-xs text-muted">
              {en
                ? "New students and areas per month"
                : "Estudiantes y áreas nuevas por mes"}
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-1 self-start rounded-full border border-border bg-background p-1 sm:self-auto">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {en ? `${option}m` : `${option}m`}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[280px] items-center justify-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="24%">
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={28}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-hover)" }}
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    studentsLabel={studentsLabel}
                    areasLabel={areasLabel}
                  />
                )}
              />
              <Legend
                onClick={(entry) => toggleSeries(entry.dataKey)}
                wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
                formatter={(value, entry) => (
                  <span
                    style={{
                      color: "var(--foreground)",
                      opacity:
                        entry.dataKey && visible[entry.dataKey as keyof SeriesVisibility]
                          ? 1
                          : 0.4,
                    }}
                  >
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="students"
                name={studentsLabel}
                hide={!visible.students}
                fill="var(--accent)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="areas"
                name={areasLabel}
                hide={!visible.areas}
                fill="var(--info)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
