import { format, isToday, isYesterday } from "date-fns";
import { enUS, es } from "date-fns/locale";
import type { Language } from "@/store/language-store";

interface ChatDateSeparatorProps {
  date: string;
  language: Language;
}

function getDayLabel(date: Date, language: Language): string {
  if (isToday(date)) {
    return language === "en" ? "Today" : "Hoy";
  }

  if (isYesterday(date)) {
    return language === "en" ? "Yesterday" : "Ayer";
  }

  const label = format(date, language === "en" ? "EEEE, MMMM d" : "EEEE d 'de' MMMM", {
    locale: language === "en" ? enUS : es,
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Separador centrado "Hoy · 20:40" al inicio de cada día, estilo iMessage. */
export function ChatDateSeparator({ date, language }: ChatDateSeparatorProps) {
  const value = new Date(date);
  const time = format(value, "p", { locale: language === "en" ? enUS : es });

  return (
    <div className="flex justify-center pb-3 pt-2">
      <span className="text-[11px] font-medium text-muted">
        {getDayLabel(value, language)} · {time}
      </span>
    </div>
  );
}
