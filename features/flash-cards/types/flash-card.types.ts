export const FLASH_CARD_TYPES = [
  "WELCOME",
  "GASTRONOMY",
  "FLORA_FAUNA",
  "ENVIRONMENTAL",
  "CURIOUS_FACT",
  "VOCABULARY",
] as const;

export type FlashCardType = (typeof FLASH_CARD_TYPES)[number];

export interface FlashCard {
  id: string;
  protectedAreaId: string;
  type: FlashCardType;
  title: string;
  content: string;
  image: string | null;
  order: number;
  question: string | null;
  options: string[];
  correctAnswer: string | null;
  createdAt: string;
}

export interface FindFlashCardsParams {
  protectedAreaId: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  type?: FlashCardType;
}

/** Etiquetas visibles para cada tipo, en el orden en que deben mostrarse. */
export const FLASH_CARD_TYPE_LABELS: Record<
  FlashCardType,
  { en: string; es: string }
> = {
  WELCOME: { en: "Welcome", es: "Bienvenida" },
  GASTRONOMY: { en: "Gastronomy", es: "Gastronomía" },
  FLORA_FAUNA: { en: "Flora and Fauna", es: "Flora y Fauna" },
  ENVIRONMENTAL: { en: "Environmental (quiz)", es: "Ambiental (opción múltiple)" },
  CURIOUS_FACT: { en: "Fun Fact", es: "Dato Curioso" },
  VOCABULARY: { en: "Vocabulary", es: "Vocabulario" },
};

/**
 * Gesto del mascota EcoGuide correspondiente a cada categoría (saludando
 * para WELCOME, binoculares para FLORA_FAUNA, foco de idea para
 * CURIOUS_FACT, letrero "VOCABULARY" para VOCABULARY, etc). Los archivos
 * deben guardarse en `public/avatars/<slug>.png` con estos nombres exactos
 * — ver FlashCardAvatar, que ya maneja el caso de que el archivo todavía
 * no exista (lo oculta en vez de romper el layout).
 */
export const FLASH_CARD_TYPE_AVATAR: Record<FlashCardType, string> = {
  WELCOME: "/avatars/welcome.png",
  GASTRONOMY: "/avatars/gastronomy.png",
  FLORA_FAUNA: "/avatars/flora-fauna.png",
  ENVIRONMENTAL: "/avatars/environmental.png",
  CURIOUS_FACT: "/avatars/curious-fact.png",
  VOCABULARY: "/avatars/vocabulary.png",
};

/**
 * Paleta por categoría, única fuente de verdad para no duplicar clases de
 * color entre el badge (maestro) y el mazo de flashcards (estudiante). Solo
 * usa tokens de HeroUI ya confirmados en el resto de la web (accent,
 * success, danger, default, cada uno con su variante -soft/-soft-foreground
 * y surface para los degradados).
 */
export const FLASH_CARD_TYPE_TONE: Record<
  FlashCardType,
  { badge: string; cardGradient: string; iconColor: string }
> = {
  WELCOME: {
    badge: "bg-accent-soft text-accent-soft-foreground",
    cardGradient: "from-accent-soft to-surface",
    iconColor: "text-accent-soft-foreground",
  },
  GASTRONOMY: {
    badge: "bg-default-soft text-foreground",
    cardGradient: "from-default-soft to-surface",
    iconColor: "text-foreground",
  },
  FLORA_FAUNA: {
    badge: "bg-success-soft text-success-soft-foreground",
    cardGradient: "from-success-soft to-surface",
    iconColor: "text-success-soft-foreground",
  },
  ENVIRONMENTAL: {
    badge: "bg-danger-soft text-danger-soft-foreground",
    cardGradient: "from-danger-soft to-surface",
    iconColor: "text-danger-soft-foreground",
  },
  CURIOUS_FACT: {
    badge: "bg-accent-soft text-accent-soft-foreground",
    cardGradient: "from-accent-soft to-surface",
    iconColor: "text-accent-soft-foreground",
  },
  VOCABULARY: {
    badge: "bg-default-soft text-foreground",
    cardGradient: "from-default-soft to-surface",
    iconColor: "text-foreground",
  },
};
