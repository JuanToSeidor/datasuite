/**
 * Comparación de arrays de objetos por un subconjunto de claves (portado de datasync `lib/utils.ts`).
 * La usa el editor de jobs para saber si el workflow en pantalla difiere del guardado.
 */

type AnyRecord = Record<string, unknown>;

function isObject(value: unknown): value is AnyRecord {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** Compara dos objetos solo en las claves indicadas; los sub-objetos se comparan recursivamente en todas sus claves. */
export function isEqualForSelectedKeys(obj1: AnyRecord, obj2: AnyRecord, includeKeys: string[]): boolean {
  const filteredKeys1 = Object.keys(obj1).filter((key) => includeKeys.includes(key));
  const filteredKeys2 = Object.keys(obj2).filter((key) => includeKeys.includes(key));

  if (filteredKeys1.length !== filteredKeys2.length) return false;

  for (const key of filteredKeys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (areObjects) {
      if (!isEqualForSelectedKeys(val1, val2, Object.keys(val1))) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

/** true si ambos arrays tienen el mismo largo y cada par de elementos coincide en `includeKeys`. */
export function areArraysEqualForSelectedKeys<T extends object>(
  arr1: T[] | undefined,
  arr2: T[] | undefined,
  includeKeys: string[]
): boolean {
  if (arr1?.length !== arr2?.length) return false;
  for (let i = 0; i < (arr1?.length ?? 0); i++) {
    if (!isEqualForSelectedKeys(arr1![i] as AnyRecord, arr2![i] as AnyRecord, includeKeys)) return false;
  }
  return true;
}
