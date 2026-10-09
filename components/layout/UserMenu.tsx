"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CaralIcon } from '@/components/icons';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/locales';
import Link from 'next/link';
import { Button, Tabs, Chip } from 'caralstable';

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  initials?: string;
}

const THEME_TABS = [
  { label: '', iconName: 'sunBright' as const },
  { label: '', iconName: 'sunMoon' as const },
  { label: '', iconName: 'pc' as const },
];

export function UserMenu({
  userName = "Juan David Torres",
  userEmail = "jdtorres@seidoranalytics.com",
  initials = "JD"
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, dict, languages, currentLanguageOption } = useLanguage();

  const activeThemeTab = theme === 'light' ? 0 : theme === 'dark' ? 1 : 2;

  const handleTabChange = (index: number) => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    if (modes[index]) {
      setTheme(modes[index]);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsLangMenuOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsLangMenuOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(!isOpen)}
        aria-label="Abrir menú de usuario"
        aria-expanded={isOpen}
        className="rounded-full shrink-0 size-[44px] bg-info-main border border-neutral-400 flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-xs"
      >
        <span className="text-white font-bold text-base tracking-wide select-none">{initials}</span>
      </div>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[310px] bg-container border border-neutral-400 rounded-[18px] shadow-2xl p-4 flex flex-col gap-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">

          {/* Header: User Info */}
          <div className="flex items-center gap-3">
            <div className="size-[42px] rounded-full bg-info-main flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[15px] leading-tight text-neutral-900 truncate">
                {userName}
              </span>
              <span className="text-xs text-neutral-800 truncate mt-0.5">
                {userEmail}
              </span>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-400 w-full" />

          {/* Theme Mode Selector using Caral Tabs */}
          <div className="w-full flex justify-center [&>div]:w-full [&_button]:flex-1">
            <Tabs
              activeIndex={activeThemeTab}
              onChange={handleTabChange}
              tabs={THEME_TABS}
              className="w-full"
            />
          </div>

          <div className="h-[1px] bg-neutral-400 w-full" />

          {/* Navigation Items with Caral Buttons */}
          <div className="flex flex-col gap-1">
            {/* Perfil */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full block decoration-transparent"
            >
              <Button
                variant="ghost"
                iconName="user"
                className="w-full !justify-start gap-3 px-2 text-neutral-900 font-medium text-sm"
              >
                {dict.userMenu.profile}
              </Button>
            </Link>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full block decoration-transparent"
            >
              <Button
                variant="ghost"
                iconName="building"
                className="w-full !justify-start gap-3 px-2 text-neutral-900 font-medium text-sm"
              >
                {dict.userMenu.dashboard}
              </Button>
            </Link>

            {/* Configuración */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full block decoration-transparent"
            >
              <Button
                variant="ghost"
                iconName="gear"
                className="w-full !justify-start gap-3 px-2 text-neutral-900 font-medium text-sm"
              >
                {dict.userMenu.settings}
              </Button>
            </Link>

            {/* Language item with toggleable submenu */}
            <div className="relative">
              <Button
                variant="ghost"
                iconName="globe"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="w-full px-2 text-neutral-900 font-medium text-sm"
              >
                <span className='w-full text-start flex items-center gap-1.5'>
                  <span>{currentLanguageOption.flag}</span>
                  <span>{currentLanguageOption.label}</span>
                </span>
                <span className={`inline-flex transition-transform duration-150 ${isLangMenuOpen ? "rotate-90" : ""}`}>
                  <CaralIcon name="chevronRigth" size={16} />
                </span>
              </Button>

              {isLangMenuOpen && (
                <div className="mt-1 mb-1 ml-4 pl-2 border-l border-neutral-300 dark:border-neutral-700 flex flex-col gap-1">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLanguage(item.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer text-left ${
                        item.code === language
                          ? "bg-info-light/20 text-info-main font-semibold"
                          : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.code === language && (
                        <span className="text-info-main">
                          <CaralIcon name="check" size={14} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Versión 2.0.0 */}
            <div className="flex items-center justify-between px-2 py-1.5 w-full text-neutral-900 text-sm font-medium">
              <div className="flex items-center gap-3">
                <CaralIcon name="command" size={20} />
                <span>{dict.userMenu.version} 2.0.0</span>
              </div>
              <Chip label={dict.userMenu.news} variant="info" />
            </div>
          </div>

          <div className="h-[1px] bg-neutral-500 w-full" />

          {/* Cerrar Sesión Button */}
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="w-full block decoration-transparent"
          >
            <Button
              variant="ghost"
              iconName="arrowLeft"
              className="w-full !justify-start gap-3 px-2 text-neutral-900 font-medium text-sm"
            >
              {dict.userMenu.logout}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
