/**
 * Ruta a un archivo de `public/` respetando el basePath del deploy
 * (en GitHub Pages la app vive bajo `/datasuite`).
 * assetPath("/dashboards/sales.jpg") -> "/datasuite/dashboards/sales.jpg"
 */
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
