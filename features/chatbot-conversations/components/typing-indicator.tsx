import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";

/** Animación de "escribiendo..." mientras se espera la respuesta del chatbot. */
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <EcoGuideAvatar size={28} className="h-7 w-7" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface-secondary px-4 py-3.5">
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: "-0.3s" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: "-0.15s" }}
        />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
      </div>
    </div>
  );
}
