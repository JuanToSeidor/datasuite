// Reemplazo de `iconcaral2` para todo el bundle (alias en next.config.ts), incluido caralstable.
//
// iconcaral2 arma el JSX de TODO el catálogo (cientos de SVG) en cada render y devuelve uno solo.
// Con decenas de iconos en pantalla, cada interacción costaba ~1 s en dev y cortaba las animaciones.
// Ambas funciones son puras (sin hooks), así que se cachea el SVG resultante por combinación de props:
// cada icono/tamaño/color se construye una sola vez.
//
// Importa el archivo real por su subpath exportado para no caer en el propio alias.
import { memo, type ComponentProps, type ReactNode } from "react";
import { CaralIcon as RawCaralIcon, Brand as RawBrand } from "iconcaral2/dist/IconCaral.js";

type CaralIconProps = ComponentProps<typeof RawCaralIcon>;
type BrandProps = ComponentProps<typeof RawBrand>;

const iconCache = new Map<string, ReactNode>();
const brandCache = new Map<string, ReactNode>();

function cached<P extends object>(cache: Map<string, ReactNode>, render: (props: P) => ReactNode, props: P) {
  const key = JSON.stringify(props);
  let node = cache.get(key);
  if (node === undefined) {
    node = render(props);
    cache.set(key, node);
  }
  return node;
}

export const CaralIcon = memo(function CaralIcon(props: CaralIconProps) {
  return <>{cached(iconCache, RawCaralIcon as (p: CaralIconProps) => ReactNode, props)}</>;
});

export const Brand = memo(function Brand(props: BrandProps) {
  return <>{cached(brandCache, RawBrand as (p: BrandProps) => ReactNode, props)}</>;
});
