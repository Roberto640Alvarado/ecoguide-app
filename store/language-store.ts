import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "es";

interface LanguageState {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      toggleLanguage: () =>
        set((state) => ({ language: state.language === "en" ? "es" : "en" })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "ecoguide-language",
    },
  ),
);
