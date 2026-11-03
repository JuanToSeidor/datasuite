/**
 * Reemplaza los placeholders `{clave}` de un texto del diccionario.
 * formatMessage("hace {n} min", { n: 42 }) -> "hace 42 min"
 */
export function formatMessage(
  template: string,
  values: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
