"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Language, TranslationDictionary, dictionaries, SUPPORTED_LANGUAGES, LanguageOption } from "@/locales";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dict: TranslationDictionary;
  t: (keyPath: string, fallback?: string) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const savedLang = localStorage.getItem("suite_language") as Language;
      if (savedLang && (savedLang === "es" || savedLang === "en" || savedLang === "pt")) {
        setLanguageState(savedLang);
      }
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("suite_language", newLang);
    }
  };

  const dict = useMemo(() => {
    return dictionaries[language] || dictionaries.es;
  }, [language]);

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = (keyPath: string, fallback?: string): string => {
    try {
      const keys = keyPath.split(".");
      let current: any = dict;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          // Fallback to Spanish dictionary if key is missing
          let esCurrent: any = dictionaries.es;
          for (const k of keys) {
            if (esCurrent && typeof esCurrent === "object" && k in esCurrent) {
              esCurrent = esCurrent[k];
            } else {
              esCurrent = undefined;
              break;
            }
          }
          if (typeof esCurrent === "string") return esCurrent;
          return fallback || keyPath;
        }
      }
      if (typeof current === "string") {
        return current;
      }
      return fallback || keyPath;
    } catch {
      return fallback || keyPath;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dict,
        t,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    const defaultDict = dictionaries.es;
    return {
      language: "es" as Language,
      setLanguage: () => {},
      dict: defaultDict,
      t: (keyPath: string, fallback?: string) => {
        const keys = keyPath.split(".");
        let current: any = defaultDict;
        for (const k of keys) {
          if (current && typeof current === "object" && k in current) {
            current = current[k];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof current === "string" ? current : fallback || keyPath;
      },
      languages: SUPPORTED_LANGUAGES,
      currentLanguageOption: SUPPORTED_LANGUAGES[0],
    };
  }
  return context;
}
