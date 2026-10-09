"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { CaralIcon, Icons } from "@/components/icons";
import { Button } from "caralstable";
import { Input } from "./Input";

export interface IconCategoryDef {
  name: string;
  icons: Icons[];
}

export const PORTAL_ICON_CATEGORIES: IconCategoryDef[] = [
  {
    name: "Tecnología",
    icons: [
      "cameraSecurity", "cameraSecurityRoof", "charScreen", "charBarScreen", "chartFile", "chartSimple",
      "circles", "clickCheck", "clickCursor", "clickTab", "cloud", "cloudFly", "cloudSync", "cloudUp",
      "code", "command", "plus", "comments", "commentsServer", "cube", "dron", "fileDown", "fileZip",
      "gear", "image", "mapBranch", "pc", "link", "wrench", "network", "mobile", "laptop", "storage",
      "robot", "satellite", "shakePhone", "shieldHalved", "sliderHorizontal", "sliderVertical", "sms",
      "squareFace", "sunBright", "sunMoon", "tab", "toggleOff", "toggleOn", "upRightFromSquare", "video",
      "volume", "wifi", "wifiLeft", "wrenchPrice", "play", "pause", "database", "folder", "grid", "window",
      "x", "wave", "dollarTower", "dateCheck", "stethoscope"
    ],
  },
  {
    name: "Journey",
    icons: [
      "airplane", "anchor", "bus", "car", "dispenser", "flag", "globe", "globeMap", "helicopter",
      "locationPin", "map", "moto", "motorcycle", "oilWell", "planeArrival", "planeDeparture", "plane",
      "scraper", "signsPost", "skateboard", "skateboardElectric", "trailer", "train", "truckMedical", "truck"
    ],
  },
  {
    name: "Financiero",
    icons: [
      "bank", "calendaEuro", "calculator", "cartShopping", "cartShoppingCircle", "cartShoppingPin",
      "cartShoppingPlus", "cartShoppingSlash", "creditCard", "dolar", "dolarReceipt", "dolarScreen",
      "euro", "moneyBill", "moneyBills", "moneySlash", "percent", "percentCircle", "piggyBank", "price",
      "receipt", "scaleBalanced"
    ],
  },
  {
    name: "Build",
    icons: [
      "cubeInCube", "cupeUpView", "puzzle", "puzzleOut", "building", "city", "businessTime", "wrench", "wrenchPrice"
    ],
  },
  {
    name: "People",
    icons: [
      "user", "users", "userConfig", "usersMap", "usersWifi", "personCopy", "accessible", "assist",
      "peopleDress", "female", "male"
    ],
  },
  {
    name: "Utilidades",
    icons: [
      "bell", "book", "bookmark", "box", "calendar", "calendarTime", "certificate", "chats", "check",
      "checkBox", "checkFile", "checkList", "checkSearch", "circleInfo", "circleBars", "clock", "coffee",
      "edit", "editFile", "editScreen", "envelope", "envelopeOpen", "envelopeSend", "eye", "eyeSlash",
      "file", "fileClick", "fileShare", "filter", "flagPointer", "house", "iD", "infoFile", "key",
      "ligthOn", "like", "likeFile", "dislike", "dislikeFile", "lock", "lockOpen", "lockSlash",
      "lockSquare", "lockSync", "megaphone", "mesagge", "message", "messagePhone", "newspaper", "newFile",
      "note", "noFound", "pin", "portafolio", "presentationScreenBar", "presentationScreenChart", "print",
      "quote", "save", "schedule", "screenBar", "screenChart", "screenView", "search", "searchPerson",
      "star", "store", "shop", "sync", "trash", "triangleExclamation", "upStairs", "downStairs", "virus",
      "waveScreen", "xCircle", "zoomIn", "zoomOut"
    ],
  },
  {
    name: "Nature",
    icons: [
      "leaf", "leafPlant", "learn", "eeedling", "seedlingBottle", "seedlingPot", "wheat"
    ],
  },
  {
    name: "Arrows",
    icons: [
      "arrowDown", "arrowLeft", "arrowPointer", "arrowRight", "arrowUp", "arrowUpArrowDown",
      "arrowDownToLine", "arrowUpToLine", "arrowsLeftRight", "arrowsLeftRightToLine", "arrowsMaximize",
      "arrowsMinimize", "arrowsMove", "arrowsUpDown", "chevronsDown", "chevronsLeft", "chevronsRigth",
      "chevronsUp", "chevronDown", "chevronDownBox", "chevronDownCircle", "chevronLeft", "chevronLeftBox",
      "chevronLeftCircle", "chevronRigth", "chevronRigthBox", "chevronRigthCircle", "chevronUp", "chevronUpBox",
      "chevronUpCircle"
    ],
  },
  {
    name: "Joins",
    icons: [
      "fullJoin", "fullJoinW", "innerJoin", "leftJoin", "leftJoinW", "rigthJoin", "rigthJoinW"
    ],
  },
];

export interface IconSelectorProps {
  value: Icons;
  onChange: (icon: Icons) => void;
  color?: string;
  label?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function IconSelector({
  value,
  onChange,
  color = "#0191FF",
  label,
  className = "",
  variant = "default",
}: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<Icons>(value || "grid");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tecnología");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(value || "grid");
      setSearch("");
      setSelectedCategory("Tecnología");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, value]);

  const currentCategoryDef = useMemo(() => {
    return PORTAL_ICON_CATEGORIES.find((c) => c.name === selectedCategory) || PORTAL_ICON_CATEGORIES[0];
  }, [selectedCategory]);

  const filteredIcons = useMemo(() => {
    let pool = currentCategoryDef.icons;

    if (search.trim()) {
      // If searching, search across all categories
      const allPool = Array.from(new Set(PORTAL_ICON_CATEGORIES.flatMap((c) => c.icons)));
      return allPool.filter((icon) =>
        icon.toLowerCase().includes(search.toLowerCase().trim())
      );
    }

    return pool;
  }, [search, currentCategoryDef]);

  const handleConfirm = () => {
    onChange(tempSelected);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("grid");
    setIsOpen(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-container border border-neutral-400 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 z-10"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-400">
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Seleccionar Ícono
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-neutral-800 hover:text-neutral-900 cursor-pointer p-1 rounded-md hover:bg-neutral-500/10 transition-colors"
            title="Cerrar"
          >
            <CaralIcon name="x" size={16} />
          </button>
        </div>

        {/* Categories Bar & Search Input */}
        <div className="px-6 pt-4 pb-3 space-y-3">
          {/* Horizontal Categories Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {PORTAL_ICON_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearch("");
                  }}
                  className={`px-3 py-1 rounded-md text-xs transition-all shrink-0 cursor-pointer border select-none ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white font-medium shadow-xs"
                      : "border-transparent bg-neutral-500/10 text-neutral-800 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-500/20 font-normal"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="w-full">
            <Input
              placeholder="Buscar ícono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconName="search"
              className="py-1.5 text-xs bg-container"
              autoFocus
            />
          </div>
        </div>

        {/* Icons Grid Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2 scrollbar-thin">
          {filteredIcons.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-800 space-y-2">
              <CaralIcon name="search" size={28} classname="mx-auto text-neutral-800/60" />
              <p>No se encontraron íconos para &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-2.5 py-2">
              {filteredIcons.map((icon) => {
                const isSelected = tempSelected === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setTempSelected(icon)}
                    onDoubleClick={() => {
                      onChange(icon);
                      setIsOpen(false);
                    }}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer group select-none ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-500/20 ring-2 ring-neutral-900 shadow-xs"
                        : "border-neutral-400 bg-container hover:border-neutral-900 hover:bg-neutral-500/10"
                    }`}
                    title={`${icon} (Doble clic para seleccionar)`}
                  >
                    <CaralIcon
                      name={icon}
                      size={22}
                      classname={`transition-colors ${
                        isSelected ? "text-neutral-900 font-bold" : "text-neutral-800"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-neutral-400 bg-container gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-neutral-800 hover:text-neutral-900 cursor-pointer px-2 py-1.5 transition-colors"
          >
            Quitar ícono
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-medium text-neutral-800 hover:text-neutral-900 cursor-pointer px-2 py-1.5 transition-colors"
          >
            Cancelar
          </button>
          <Button
            variant="default"
            size="sm"
            className="text-neutral-100! px-4"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <>
        <div
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: `${color}20`, borderColor: color }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 shadow-xs cursor-pointer hover:scale-105 transition-all group relative select-none ${className}`}
          title="Haz clic para seleccionar ícono"
        >
          <span style={{ color }} className="flex items-center">
            <CaralIcon name={value || "grid"} size={18} />
          </span>
        </div>

        {/* Render Modal via Portal when Open */}
        {isOpen && mounted && createPortal(modalContent, document.body)}
      </>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-900 select-none">
          {label}
        </label>
      )}

      {/* Trigger Card */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-400 bg-container hover:bg-neutral-500/10 cursor-pointer transition-all select-none gap-3 shadow-xs group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{ backgroundColor: `${color}18`, borderColor: `${color}40` }}
            className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-colors"
          >
            <span style={{ color }} className="flex items-center">
              <CaralIcon name={value || "grid"} size={18} />
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-neutral-900 capitalize truncate block">
              {value || "Seleccionar ícono"}
            </span>
            <span className="text-[11px] text-neutral-800">
              Haz clic para abrir la librería de íconos
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          hasBorder
          size="sm"
          className="text-xs text-neutral-900 pointer-events-none group-hover:bg-neutral-500/20"
        >
          Explorar
        </Button>
      </div>

      {/* Render Modal via Portal when Open */}
      {isOpen && mounted && createPortal(modalContent, document.body)}
    </div>
  );
}
