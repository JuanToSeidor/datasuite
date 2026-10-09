"use client";

import React, { forwardRef } from "react";
import { CaralIcon } from "@/components/icons";
import { Icons } from "iconcaral2";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  detail?: string;
  error?: string;
  iconName?: Icons;
  iconPosition?: "left" | "right";
  rightElement?: React.ReactNode;
  containerClassName?: string;
  multiline?: boolean;
  rows?: number;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  detail?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      helperText,
      detail,
      error,
      iconName,
      iconPosition = "left",
      rightElement,
      containerClassName = "",
      className = "",
      id,
      multiline = false,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const subText = helperText || detail;

    const baseFieldClasses = `w-full px-3 py-2 text-sm rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:border-info-main focus:ring-2 focus:ring-info-main/20 transition-all font-poppins ${iconName && iconPosition === "left" ? "pl-10!" : ""
      } ${iconName && iconPosition === "right" ? "pr-10!" : ""} ${rightElement ? "pr-10!" : ""
      } ${error
        ? "border-danger-main ring-1 ring-danger-main/30 focus:border-danger-main focus:ring-danger-main/30"
        : ""
      } ${className}`;

    return (
      <div className={`flex flex-col gap-1 w-full font-poppins ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-900 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative w-full flex items-center">
          {iconName && iconPosition === "left" && !multiline && (
            <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-neutral-800 z-10">
              <CaralIcon name={iconName} size={16} classname="text-neutral-800" />
            </div>
          )}

          {multiline ? (
            <textarea
              ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
              id={inputId}
              rows={rows}
              className={`${baseFieldClasses} resize-none`}
              {...(props as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.ForwardedRef<HTMLInputElement>}
              id={inputId}
              className={baseFieldClasses}
              {...props}
            />
          )}

          {iconName && iconPosition === "right" && !rightElement && !multiline && (
            <div className="absolute right-0 pr-3.5 flex items-center pointer-events-none text-neutral-800 z-10">
              <CaralIcon name={iconName} size={16} classname="text-neutral-800" />
            </div>
          )}

          {rightElement && !multiline && (
            <div className="absolute right-0 pr-1.5 flex items-center z-10">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <span className="text-[11px] text-danger-main font-medium">{error}</span>
        ) : subText ? (
          <p className="text-sm text-neutral-800">{subText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      detail,
      error,
      containerClassName = "",
      className = "",
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const subText = helperText || detail;

    return (
      <div className={`flex flex-col gap-1 w-full font-poppins ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-900 select-none"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={`w-full px-3 py-2 text-sm rounded-lg bg-container border border-neutral-500 text-neutral-900 placeholder:text-neutral-800 focus:outline-none focus:border-info-main focus:ring-2 focus:ring-info-main/20 transition-all font-poppins resize-none ${error
              ? "border-danger-main ring-1 ring-danger-main/30 focus:border-danger-main focus:ring-danger-main/30"
              : ""
            } ${className}`}
          {...props}
        />

        {error ? (
          <span className="text-[11px] text-danger-main font-medium">{error}</span>
        ) : subText ? (
          <p className="text-sm text-neutral-800">{subText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
