"use client";

import { useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const LOCALE_BY_LANGUAGE: Record<string, string> = { es: "es-ES", en: "en-US", pt: "pt-BR" };

export function useLocaleTag() {
  const { language } = useLanguage();
  return LOCALE_BY_LANGUAGE[language] ?? "en-US";
}

/** Fecha corta con hora (dd/mm/aa hh:mm), como en el diseño. */
export function useDateTimeFormatter() {
  const locale = useLocaleTag();
  return useCallback(
    (value: string) => {
      const date = new Date(value);
      const day = date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "2-digit" });
      const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
      return `${day} ${time}`;
    },
    [locale]
  );
}
