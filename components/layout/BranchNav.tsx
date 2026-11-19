"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from 'caralstable';
import { Branch, SidebarItem, SidebarSection } from '@/config/suite';

/**
 * Navegación del módulo (branch) activo, ubicada bajo el logo de Crestone en la barra superior.
 * El home del módulo no aparece aquí: se accede con el logo.
 * - Branch con una sola sección: sus items se muestran directo como botones.
 * - Branch con varias secciones: cada sección es un desplegable; si la sección tiene un solo
 *   item, se muestra directo (un desplegable de un elemento no aporta nada).
 */
export function BranchNav({ branch }: { branch: Branch }) {
  const pathname = usePathname();
  // El overview/home del módulo (href === branch.href) se abre desde el logo de Crestone,
  // así que no se repite como botón en el menú.
  const sections = (branch.sidebarSections ?? [])
    .map((s) => ({ ...s, items: s.items.filter((item) => item.href !== branch.href) }))
    .filter((s) => s.items.length > 0);
  const allItems = sections.flatMap((s) => s.items);

  // Match exacto o subruta sin un match más específico (evita que /optimize quede activo en /optimize/accounts).
  const isItemActive = (item: SidebarItem) => {
    if (pathname === item.href) return true;
    const isSubRoute = item.href !== '/' && pathname.startsWith(item.href + '/');
    if (!isSubRoute) return false;
    return !allItems.some(
      (other) =>
        other.href !== item.href &&
        other.href.length > item.href.length &&
        (pathname === other.href || pathname.startsWith(other.href + '/'))
    );
  };

  if (allItems.length === 0) return null;

  const showFlat = sections.length === 1;

  return (
    <nav className="flex items-center gap-1 flex-nowrap">
      {showFlat
        ? sections[0].items.map((item) => (
            <NavItemButton key={item.href} item={item} isActive={isItemActive(item)} color={branch.color} />
          ))
        : sections.map((section, idx) =>
            section.items.length === 1 ? (
              <NavItemButton
                key={section.sectionTitle || idx}
                item={section.items[0]}
                isActive={isItemActive(section.items[0])}
                color={branch.color}
              />
            ) : (
              <SectionDropdown
                key={section.sectionTitle || idx}
                section={section}
                color={branch.color}
                isItemActive={isItemActive}
              />
            )
          )}
    </nav>
  );
}

function activeStyle(color: string): React.CSSProperties {
  return { background: color, borderColor: color, color: '#ffffff' };
}

function NavItemButton({ item, isActive, color }: { item: SidebarItem; isActive: boolean; color: string }) {
  const button = (
    <Button
      size="sm"
      variant="ghost"
      iconName={item.iconName}
      style={isActive ? activeStyle(color) : undefined}
      className={isActive ? 'text-white!' : 'text-neutral-800!'}
    >
      {item.label}
    </Button>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer">
        {button}
      </a>
    );
  }
  return <Link href={item.href}>{button}</Link>;
}

function SectionDropdown({
  section,
  color,
  isItemActive,
}: {
  section: SidebarSection;
  color: string;
  isItemActive: (item: SidebarItem) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const activeItem = section.items.find(isItemActive);

  // Cerrar al navegar y al hacer click fuera.
  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant="ghost"
        isDropdown
        isOpen={isOpen}
        iconName={activeItem?.iconName}
        style={activeItem ? activeStyle(color) : undefined}
        className={activeItem ? 'text-white!' : 'text-neutral-800!'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {activeItem ? `${section.sectionTitle ?? ''}${section.sectionTitle ? ' · ' : ''}${activeItem.label}` : section.sectionTitle}
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 min-w-[220px] bg-container border border-neutral-200 rounded-2xl shadow-xl p-2 flex flex-col gap-1 z-[60]">
          {section.items.map((item) => {
            const isActive = isItemActive(item);
            const button = (
              <Button
                size="sm"
                variant="ghost"
                iconName={item.iconName}
                style={isActive ? activeStyle(color) : undefined}
                className={`w-full !justify-start ${isActive ? 'text-white!' : 'text-neutral-800!'}`}
              >
                {item.label}
              </Button>
            );
            return item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="block w-full">
                {button}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="block w-full">
                {button}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
