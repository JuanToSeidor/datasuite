"use client";

import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterNodesProps {
  setFilterName: (value: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
}

/** Buscador por nombre de la librería de nodos de extracción. */
const FilterNodes = ({ setFilterName, setIsFilterOpen }: FilterNodesProps) => {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsFilterOpen]);

  return (
    <div ref={ref} onFocus={() => setIsFilterOpen(true)}>
      <Input
        iconName="search"
        placeholder={t("moveJobsEditor.editor.library.search")}
        onChange={(e) => setFilterName(e.currentTarget.value)}
      />
    </div>
  );
};

export default FilterNodes;
