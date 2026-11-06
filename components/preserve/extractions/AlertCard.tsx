"use client";

import React from "react";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";

export type AlertTone = "info" | "warning";

const ALERT_TONE: Record<AlertTone, { strip: string; body: string }> = {
  info: { strip: "bg-info-main", body: "bg-container" },
  warning: { strip: "bg-warning-main", body: "bg-warning-light" },
};

export interface AlertCardProps {
  tone: AlertTone;
  iconName: "circleInfo" | "triangleExclamation";
  title: string;
  text: string;
  /** Acción opcional (texto del botón y su handler). */
  actionLabel?: string;
  onAction?: () => void;
  /** Sin handler no se muestra el botón de cierre. */
  closeLabel?: string;
  onDismiss?: () => void;
}

/** Aviso con franja de color, título, texto, acción y cierre opcionales. */
export function AlertCard({
  tone,
  iconName,
  title,
  text,
  actionLabel,
  onAction,
  closeLabel,
  onDismiss,
}: AlertCardProps) {
  const styles = ALERT_TONE[tone];
  return (
    <div className="flex overflow-hidden rounded-lg border border-neutral-300">
      <div className={`flex w-12 shrink-0 justify-center pt-4 ${styles.strip}`}>
        <span className="text-neutral-100">
          <CaralIcon name={iconName} size={22} color="currentColor" />
        </span>
      </div>
      <div className={`flex min-w-0 flex-1 flex-col gap-2 p-3 ${styles.body}`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          {onDismiss && (
            <Button
              isIconButton
              iconName="x"
              variant="ghost"
              size="sm"
              aria-label={closeLabel}
              onClick={onDismiss}
            />
          )}
        </div>
        <p className="text-xs text-neutral-800">{text}</p>
        {actionLabel && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
