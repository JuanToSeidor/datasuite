import { es, TranslationDictionary } from "./es";
import { en } from "./en";
import { pt } from "./pt";

export type Language = "es" | "en" | "pt";

export interface LanguageOption {
  code: Language;
  label: string;
  shortLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "es", label: "Español", shortLabel: "ES", flag: "🇪🇸" },
  { code: "en", label: "English", shortLabel: "EN", flag: "🇺🇸" },
  { code: "pt", label: "Português", shortLabel: "PT", flag: "🇧🇷" },
];

export const dictionaries: Record<Language, TranslationDictionary> = {
  es,
  en,
  pt,
};

export { es, en, pt };
export type { TranslationDictionary };
