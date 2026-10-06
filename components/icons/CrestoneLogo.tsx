import React from "react";

interface CrestoneLogoProps {
  size?: number;
  accentColor?: string;
  bodyColor?: string;
  className?: string;
}

export function CrestoneLogo({
  size = 24,
  accentColor = "var(--color-info-main, #0191FF)",
  bodyColor,
  className = "",
}: CrestoneLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-colors duration-300 ${className}`}
    >
      {/* 3 Nodos / Círculos con el color de acento dinámico según el producto */}
      <path
        d="M19.7454 7.60524C21.8195 7.60524 23.5009 5.90275 23.5009 3.80262C23.5009 1.70249 21.8195 0 19.7454 0C17.6714 0 15.99 1.70249 15.99 3.80262C15.99 5.90275 17.6714 7.60524 19.7454 7.60524Z"
        fill={accentColor}
      />
      <path
        d="M4.49388 15.8369C6.56794 15.8369 8.2493 14.1344 8.2493 12.0343C8.2493 9.93418 6.56794 8.23169 4.49388 8.23169C2.41982 8.23169 0.738464 9.93418 0.738464 12.0343C0.738464 14.1344 2.41982 15.8369 4.49388 15.8369Z"
        fill={accentColor}
      />
      <path
        d="M19.8754 24C21.9494 24 23.6308 22.2975 23.6308 20.1974C23.6308 18.0973 21.9494 16.3948 19.8754 16.3948C17.8013 16.3948 16.1199 18.0973 16.1199 20.1974C16.1199 22.2975 17.8013 24 19.8754 24Z"
        fill={accentColor}
      />

      {/* Arcos conectores base */}
      <path
        d="M14.768 5.12666H13.7532C11.1401 5.12666 9.08299 6.2915 7.91207 8.14169C7.00301 7.32276 5.80617 6.82451 4.49356 6.82451C3.99611 6.82451 3.51583 6.89744 3.06079 7.03069C4.83517 3.49526 8.54314 1.04492 13.5519 1.04492H15.3805C14.8864 1.84477 14.6 2.78981 14.6 3.80266C14.6 4.26035 14.6586 4.70373 14.7683 5.12666H14.768Z"
        fill={bodyColor || "#07153A"}
        className={bodyColor ? "" : "dark:fill-[#E2E8F0]"}
      />
      <path
        d="M7.88179 15.9539C9.04732 17.8317 11.1172 19.0043 13.7535 19.0043H14.8672C14.7784 19.3877 14.7303 19.7868 14.7303 20.1975C14.7303 21.2662 15.0487 22.2593 15.5936 23.0861H13.5519C8.50881 23.0861 4.78435 20.602 3.02478 17.0277C3.49025 17.1681 3.98332 17.2445 4.4939 17.2445C5.7917 17.2445 6.97676 16.7568 7.88179 15.9539Z"
        fill={bodyColor || "#07153A"}
        className={bodyColor ? "" : "dark:fill-[#E2E8F0]"}
      />
    </svg>
  );
}
