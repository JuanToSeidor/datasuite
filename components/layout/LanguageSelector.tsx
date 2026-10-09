"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/locales";
import { CaralIcon } from "@/components/icons";
import { Button } from "caralstable";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, languages, currentLanguageOption } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Seleccionar idioma"
        aria-expanded={isOpen}
        variant="ghost"
      >
        <CaralIcon name="globe" size={18} />
        <span className="text-xs font-semibold uppercase tracking-wider">{currentLanguageOption.shortLabel}</span>
        <span className={`inline-flex transition-transform duration-200 opacity-60 ${isOpen ? "rotate-180" : ""}`}>
          <CaralIcon name="chevronDown" size={14} />
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[180px] bg-container border border-neutral-400 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            {language === "es" ? "Idioma" : language === "en" ? "Language" : "Idioma"}
          </div>

          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left ${isSelected
                  ? "bg-info-light/20 text-info-main font-semibold"
                  : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                  }`}
              >
                <div className="flex items-center gap-2.5">

                  <span>{item.label}</span>
                </div>
                {isSelected && (
                  <span className="text-info-main">
                    <CaralIcon name="check" size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
