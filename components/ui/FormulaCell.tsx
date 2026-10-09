"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export function evaluateFormula(rawInput: string, currentAmount: number, baseTotalAmount: number = 0): number {
  if (!rawInput || !rawInput.trim()) return 0;
  let text = rawInput.trim().replace(/[()$]/g, '').trim();

  // 1. Handle percentage directly (e.g. "35%" or "35.5 %")
  if (/^\s*([0-9]+(\.[0-9]+)?)\s*%\s*$/.test(text)) {
    const match = text.match(/([0-9]+(\.[0-9]+)?)/);
    if (match) {
      const pct = parseFloat(match[1]);
      return baseTotalAmount > 0 ? (baseTotalAmount * pct) / 100 : pct;
    }
  }

  // 2. Handle relative operations: "+10", "-5%", "*1.5", "/2"
  const relativeMatch = text.match(/^([+\-*/])\s*([0-9]+(\.[0-9]+)?)\s*(%)?$/);
  if (relativeMatch) {
    const op = relativeMatch[1];
    let operand = parseFloat(relativeMatch[2]);
    const isPct = !!relativeMatch[4];
    if (isPct && baseTotalAmount > 0) {
      operand = (baseTotalAmount * operand) / 100;
    }

    switch (op) {
      case '+':
        return currentAmount + operand;
      case '-':
        return Math.max(0, currentAmount - operand);
      case '*':
        return currentAmount * operand;
      case '/':
        return operand !== 0 ? currentAmount / operand : currentAmount;
    }
  }

  // 3. Replace embedded percentages in expressions (e.g. "20% + 50")
  text = text.replace(/([0-9]+(\.[0-9]+)?)\s*%/g, (_, p) => {
    return baseTotalAmount > 0 ? ((baseTotalAmount * parseFloat(p)) / 100).toString() : p;
  });

  // 4. Safely evaluate arithmetic expression
  if (!/^[0-9+\-*/.\s]+$/.test(text)) {
    const fallback = parseFloat(text);
    return isNaN(fallback) ? currentAmount : Math.max(0, fallback);
  }

  try {
    const result = new Function(`return (${text})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.max(0, result);
    }
  } catch {
    const fallback = parseFloat(text);
    return isNaN(fallback) ? currentAmount : Math.max(0, fallback);
  }

  return currentAmount;
}

export interface FormulaCellProps {
  value: number;
  baseAmount?: number;
  currencySymbol?: string;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  title?: string;
}

export function FormulaCell({
  value,
  baseAmount = 0,
  currencySymbol = '$',
  onChange,
  disabled = false,
  className = '',
  placeholder = '0.00',
  title,
}: FormulaCellProps) {
  const { dict } = useLanguage();
  const cellTitle = title || dict.table.formulaPlaceholder;
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(Number(value || 0).toFixed(2));

  useEffect(() => {
    if (!isFocused) {
      setInputValue(Number(value || 0).toFixed(2));
    }
  }, [value, isFocused]);

  const commitValue = () => {
    const computed = evaluateFormula(inputValue, value || 0, baseAmount);
    const rounded = Number(computed.toFixed(2));
    onChange(rounded);
    setInputValue(rounded.toFixed(2));
    setIsFocused(false);
  };

  if (disabled) {
    return (
      <span className="font-mono text-xs font-semibold text-neutral-900">
        {currencySymbol}
        {Number(value || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    );
  }

  return (
    <div className={`flex items-center justify-end gap-1 ${className}`}>
      {currencySymbol && (
        <span className="text-xs select-none">{currencySymbol}</span>
      )}
      <input
        type="text"
        value={
          isFocused
            ? inputValue
            : Number(value || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
        }
        onFocus={(e) => {
          setIsFocused(true);
          setInputValue(Number(value || 0).toFixed(2));
          e.target.select();
        }}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitValue();
            (e.target as HTMLInputElement).blur();
          } else if (e.key === 'Escape') {
            setInputValue(Number(value || 0).toFixed(2));
            setIsFocused(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
        title={cellTitle}
        placeholder={placeholder}
        className="w-24 px-2 py-1 text-right text-xs font-mono font-bold rounded-lg border border-neutral-500 bg-container text-neutral-900 focus:outline-none focus:ring-2 focus:ring-info-main/40 focus:border-info-main hover:border-neutral-800 transition-all shadow-2xs"
      />
    </div>
  );
}
