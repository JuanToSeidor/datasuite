"use client";

import React, { forwardRef } from 'react';
import { CaralIcon } from '@/components/icons';
import { Icons } from 'iconcaral2';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  iconName?: Icons;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  iconName,
  iconPosition = 'left',
  containerClassName = '',
  className = '',
  error,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-bold text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {iconName && (
          <div
            className={`absolute inset-y-0 ${
              iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'
            } flex items-center pointer-events-none text-neutral-800 z-10`}
          >
            <CaralIcon name={iconName} size={16} />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full py-2 text-sm rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
            iconName
              ? iconPosition === 'left'
                ? 'pl-9! pr-3!'
                : 'pl-3! pr-9!'
              : 'px-3!'
          } ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
