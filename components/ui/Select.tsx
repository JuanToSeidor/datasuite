"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CaralIcon, Brand, CaralBrandName, Icons } from '@/components/icons';

export interface SelectOption {
  value: string | number;
  label: string;
  iconName?: Icons;
  brand?: CaralBrandName;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  iconName?: Icons;
  brand?: CaralBrandName;
  leftIcon?: React.ReactNode;
  options?: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: { target: { value: any; name?: string } }) => void;
  onValueChange?: (value: string | number) => void;
  name?: string;
  placeholder?: string;
  containerClassName?: string;
  className?: string;
  dropdownClassName?: string;
  error?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  iconName,
  brand,
  leftIcon,
  options: directOptions,
  value: controlledValue,
  defaultValue,
  onChange,
  onValueChange,
  name,
  placeholder = 'Seleccionar...',
  containerClassName = '',
  className = '',
  dropdownClassName = '',
  error,
  disabled = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number | undefined>(
    defaultValue !== undefined ? defaultValue : undefined
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  // Extract options from props.options or children (<option value="..." data-icon="..." data-brand="...">label</option>)
  const parsedOptions: SelectOption[] = useMemo(() => {
    if (directOptions && directOptions.length > 0) {
      return directOptions;
    }
    const opts: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const childProps = child.props as {
          value?: any;
          children?: React.ReactNode;
          disabled?: boolean;
          iconName?: Icons;
          brand?: CaralBrandName;
          icon?: React.ReactNode;
          'data-icon'?: Icons;
          'data-brand'?: CaralBrandName;
        };
        if (childProps) {
          opts.push({
            value: childProps.value !== undefined ? childProps.value : childProps.children,
            label: childProps.children ? String(childProps.children) : String(childProps.value),
            disabled: childProps.disabled,
            iconName: childProps.iconName || childProps['data-icon'],
            brand: childProps.brand || childProps['data-brand'],
            icon: childProps.icon,
          });
        }
      }
    });
    return opts;
  }, [directOptions, children]);

  // Selected option label and active icon
  const selectedOption = parsedOptions.find(
    (opt) => String(opt.value) === String(currentValue)
  );

  const displayLabel = selectedOption
    ? selectedOption.label
    : currentValue !== undefined
      ? String(currentValue)
      : placeholder;

  const activeIcon = selectedOption?.icon || (
    selectedOption?.brand ? (
      <Brand name={selectedOption.brand} size={16} />
    ) : selectedOption?.iconName ? (
      <CaralIcon name={selectedOption.iconName} size={16} />
    ) : leftIcon ? (
      leftIcon
    ) : brand ? (
      <Brand name={brand} size={16} />
    ) : iconName ? (
      <CaralIcon name={iconName} size={16} />
    ) : null
  );

  // Close when clicking outside
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const handleSelectOption = (opt: SelectOption) => {
    if (opt.disabled) return;
    if (controlledValue === undefined) {
      setInternalValue(opt.value);
    }
    setIsOpen(false);

    if (onChange) {
      onChange({ target: { value: opt.value, name } });
    }
    if (onValueChange) {
      onValueChange(opt.value);
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1 relative ${containerClassName}`}>
      {label && (
        <label className="text-xs font-bold text-neutral-800 select-none">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full py-2 text-sm rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:border-neutral-600 transition-all cursor-pointer ${
            activeIcon ? 'pl-9! pr-8!' : 'px-3! pr-8!'
          } ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
          {activeIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-800 z-10">
              {activeIcon}
            </div>
          )}

          <span className="truncate block font-medium">
            {displayLabel}
          </span>

          <div
            className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-800 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            <CaralIcon name="chevronDown" size={14} />
          </div>
        </button>

        {/* Floating Custom Dropdown Menu with Rounded Corners & Soft Shadow */}
        {isOpen && (
          <div
            className={`absolute top-[calc(100%+6px)] left-0 min-w-full z-[100] bg-container border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-xl py-1.5 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
          >
            {parsedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-800">No hay opciones</div>
            ) : (
              parsedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(currentValue);
                const optIcon = opt.icon || (
                  opt.brand ? (
                    <Brand name={opt.brand} size={15} />
                  ) : opt.iconName ? (
                    <CaralIcon name={opt.iconName} size={15} />
                  ) : null
                );

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-full text-info-main font-bold'
                        : 'bg-container! hover:bg-full! text-neutral-800'
                    } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {optIcon && (
                        <span className="shrink-0 flex items-center text-neutral-800">
                          {optIcon}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <span className="text-info-main shrink-0 flex items-center">
                        <CaralIcon name="check" size={13} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};

Select.displayName = 'Select';
