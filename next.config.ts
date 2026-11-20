import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const basePath = isGithubActions ? "/datasuite" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Integra <ViewTransition> de React con las navegaciones del App Router
  // (p. ej. el KPI de licencia que se expande al abrir el detalle de la cuota).
  experimental: {
    viewTransition: true,
  },
  // iconcaral2 reconstruye todo su catálogo de SVG en cada render; este alias lo reemplaza
  // (también dentro de caralstable) por una versión que cachea cada icono. Ver lib/iconcaral2-cached.tsx.
  turbopack: {
    resolveAlias: {
      iconcaral2: "./lib/iconcaral2-cached.tsx",
    },
  },
  // Expone el basePath al cliente para armar rutas de `public/` en <img> nativos.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
