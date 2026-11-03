import React from "react";
import { Button } from "caralstable";
import { CaralIcon } from "@/components/icons";

interface AlertBannerProps {
  message: string;
  variant?: "danger" | "warning";
  onOpen?: () => void;
  openLabel?: string;
}

/** Banner de alerta de una línea con acceso al detalle (chevron a la derecha). */
export function AlertBanner({ message, variant = "danger", onOpen, openLabel }: AlertBannerProps) {
  const tone =
    variant === "danger"
      ? "bg-danger-light text-danger-main"
      : "bg-warning-light text-warning-main";

  return (
    <div className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 font-poppins ${tone}`}>
      <span className="shrink-0">
        <CaralIcon name="triangleExclamation" size={22} color="currentColor" />
      </span>
      <p className="flex-1 text-sm font-semibold sm:text-base">{message}</p>
      {onOpen && (
        <Button
          variant="ghost"
          isIconButton
          iconName="chevronRigth"
          onClick={onOpen}
          title={openLabel}
          aria-label={openLabel}
        />
      )}
    </div>
  );
}
