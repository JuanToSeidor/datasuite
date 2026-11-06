"use client";

import { useEffect, useRef } from "react";

/** Versión chica del logo animado de LoadingScreen, para indicadores dentro de la pantalla. */
export function LoadingLogo({ size = 22, color }: { size?: number; color?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let anim: { destroy: () => void } | undefined;
    let cancelled = false;

    // Import dinámico igual que LoadingScreen: lottie-web solo se carga en el cliente.
    import("lottie-web").then((lottieModule) => {
      const lottie = lottieModule.default || lottieModule;
      if (cancelled || !containerRef.current) return;
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/animations/crestone_motion.json",
      });
    });

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);

  // Mismos overrides de color que LoadingScreen, con el color del módulo.
  const colorOverrideClasses =
    "[&_path[fill^='rgb(217']]:!fill-[var(--loading-branch-color)] [&_path[stroke^='rgb(15']]:!stroke-[var(--color-seidor-main-text)] [&_path[fill^='rgb(252']]:!fill-[var(--color-container)]";

  return (
    <div
      ref={containerRef}
      className={`shrink-0 flex items-center justify-center ${colorOverrideClasses}`}
      style={
        {
          width: size,
          height: size,
          "--loading-branch-color": color ?? "var(--color-info-main)",
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  );
}
