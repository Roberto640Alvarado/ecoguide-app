import type { Language } from "@/store/language-store";

export interface AvatarOption {
  id: "boy" | "girl";
  src: string;
  label: Record<Language, string>;
}

/**
 * Debe mantenerse en sincronía con AVATAR_OPTIONS en
 * ecoguide-api/src/auth/dto/register.dto.ts — ambos definen la misma
 * whitelist de rutas de avatar permitidas en el registro.
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "boy",
    src: "/avatars/avatar-boy.png",
    label: { en: "Boy", es: "Niño" },
  },
  {
    id: "girl",
    src: "/avatars/avatar-girl.png",
    label: { en: "Girl", es: "Niña" },
  },
];
