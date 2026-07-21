/**
 * Utilidades compartidas para los campos de texto enriquecido (descripción
 * de área protegida, contenido de flashcard) editados con RichTextEditor
 * (Tiptap) y guardados como HTML.
 *
 * El HTML viene de un editor propio, controlado únicamente por docentes
 * (rol TEACHER) — no es contenido de terceros — pero se sanitiza igual como
 * defensa en profundidad antes de inyectarlo con dangerouslySetInnerHTML.
 */
import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "strong",
  "em",
  "s",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "br",
];

/** Sanitiza HTML de confianza propia antes de renderizarlo. En el server
 * (sin `window`) se devuelve tal cual; el cliente vuelve a sanitizar al
 * hidratar. */
export function sanitizeRichText(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }
  return DOMPurify.sanitize(html, { ALLOWED_TAGS });
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/**
 * Extrae el texto plano de un HTML, para vistas de lista/preview
 * (line-clamp, truncate) donde renderizar las etiquetas se vería roto.
 *
 * Usa siempre regex (nunca DOMParser) para que el resultado sea idéntico
 * en servidor y cliente — estos componentes se renderizan primero en el
 * servidor, y usar DOMParser solo en el cliente causaría un mismatch de
 * hidratación en cuanto el HTML tuviera alguna entidad.
 */
export function stripHtmlToText(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  const withDecodedEntities = withoutTags.replace(
    /&(amp|lt|gt|quot|#39|nbsp);/g,
    (match) => HTML_ENTITIES[match] ?? match,
  );
  return withDecodedEntities.replace(/\s+/g, " ").trim();
}

/** true si el HTML no contiene texto real (ej. "<p></p>" de un editor
 * vacío) — usado en los esquemas zod para rechazar campos "vacíos" que
 * técnicamente tienen longitud > 0. */
export function isBlankRichText(html: string): boolean {
  return stripHtmlToText(html).length === 0;
}

/**
 * Convierte texto plano (párrafos separados por línea en blanco) al HTML
 * mínimo que produce RichTextEditor, para poder precargar un ejemplo (ej.
 * "usar este ejemplo" en los prompts de Speaking Practice/Chatbot) sin que
 * el editor lo trate como una sola línea sin formato.
 */
export function plainTextToRichText(plainText: string): string {
  return plainText
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/** Clases Tailwind (selectores de hijos) para que las etiquetas que el
 * editor puede producir (listas, enlaces, citas, código) se vean
 * consistentes con el resto de la UI, sin depender de @tailwindcss/typography. */
export const richTextDisplayClassName =
  "[&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:mb-1 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-s-4 [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:italic [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-default-soft [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]";
