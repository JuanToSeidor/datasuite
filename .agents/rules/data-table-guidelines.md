# Directrices y Estándares para Tablas Agnósticas (`DataTable<T>`)

Este documento establece las reglas, patrones de diseño y estándares de arquitectura obligatorios para la creación y uso de tablas en toda la plataforma.

---

## 🎯 1. Filosofía de Tablas Agnósticas y Desacopladas

### ⚠️ Regla de Oro: `DataTable` NUNCA debe contener columnas fijas o data dura de dominio
El componente `@/components/ui/DataTable` es un motor de renderizado y gestión de datos 100% genérico. No debe tener nombres de columnas hardcodeados (como "Costos", "Mail", "Servicio", etc.) ni suposiciones sobre el esquema de datos.

1. **Responsabilidad de `DataTable<T>`**:
   - Renderizado dinámico de columnas y filas.
   - Búsqueda global, ordenamiento, filtrado por columnas y filtros de errores.
   - Redimensionamiento de columnas (*column resizing* drag & drop).
   - Modo pantalla completa (*fullscreen toggle* con soporte para `Esc`).
   - Exportación nativa a CSV con formato UTF-8 BOM.
   - Drawer de filtros dinámico y barra de filtros activos.
   - Pie de tabla (*footer*) y agregación de totales.

2. **Responsabilidad de la Página / Tab Consumidora**:
   - Definir el arreglo de configuración `DataTableColumn<T>[]`.
   - Formatear el renderizado visual de cada celda mediante `cell: ({ row, value }) => ReactNode`.
   - Configurar el comportamiento de filtros (`filterType`, `filterSelectOptions`).
   - Inyectar títulos, descripciones y botones de acción en `toolbarRight`.

---

## 📐 2. Estructura y Configuración de Columnas (`DataTableColumn<T>`)

Cada columna debe tiparse declarativamente usando la interfaz `DataTableColumn<T>`:

```typescript
export interface DataTableColumn<T = any> {
  id: string; // Identificador único de columna
  header: React.ReactNode | ((props: { column: DataTableColumn<T> }) => React.ReactNode);
  accessorKey?: keyof T; // Propiedad del objeto fila
  accessorFn?: (row: T) => any; // Función de extracción personalizada
  cell?: (props: { row: T; value: any; rowIndex: number }) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number; // Ancho inicial en px
  minWidth?: number; // Ancho mínimo permitido al redimensionar (default: 70px)
  resizable?: boolean; // Habilitar/deshabilitar resizer (default: true)

  // Configuración de Filtros
  filterable?: boolean; // true por defecto
  filterType?: 'text' | 'number' | 'currency' | 'select' | 'none';
  filterLabel?: string; // Nombre amigable para el Drawer y chips
  filterSelectOptions?: Array<{ label: string; value: string }>; // Para chips/opciones fijas
  customFilterFn?: (rowValue: any, filterState: ColumnFilterState, row: T) => boolean;

  // Footer & Totales
  footer?: React.ReactNode | ((props: { data: T[]; filteredData: T[]; column: DataTableColumn<T> }) => React.ReactNode);

  // Exportación a CSV
  exportValue?: (row: T) => string | number;
  hideInExport?: boolean;
}
```

---

## 🎛️ 3. Reglas de Filtrado y Comportamiento del Drawer

### A. Columnas de Tipo Lista / Array (`filterType: 'select'` o con `filterSelectOptions`)
Cuando una columna pertenece a una lista de opciones finita (ej. **Método de Login**, **Rol**, **Departamento**, **Estado**, **Tipo de Conexión**):
- **Ocultar**: No se debe mostrar el input de texto libre ni el selector de operadores (`Contains`, `Equals`, etc.).
- **Mostrar**: Se deben renderizar **chips interactivos multiselección**.
- **Comportamiento**:
  - El usuario puede alternar (*toggle*) uno o varios chips.
  - Se debe reflejar el contador de seleccionados (`X de Y seleccionadas`).
  - Se deben proveer botones de acceso rápido: *"Seleccionar todas"* y *"Limpiar selección"*.
  - En la barra de filtros activos de la tabla se listan las opciones elegidas (ej: `Rol: Admin, SuperAdmin`).

### B. Columnas de Tipo Texto (`filterType: 'text'`)
- Muestra el selector de operador con componente `<Select />` (`Contains`, `Does not contain`, `Equals`, `Empty`, `Starts with`, etc.).
- Muestra un `<Input />` para escribir el valor buscado.

### C. Columnas de Tipo Numérico o Moneda (`filterType: 'number' | 'currency'`)
- Muestra operadores numéricos (`Equals`, `Greater than`, `Less than`, `Between / Rango`, `Empty / 0`, `Not empty / > 0`).
- Si el operador es `between`, renderiza automáticamente dos inputs: **Valor Mínimo** y **Valor Máximo**.

---

## 🧮 4. Celdas con Fórmulas y Edición Matemática (`FormulaCell`)

Para tablas que requieran edición numérica o porcentajes inline (como tablas financieras, distribución de costos o presupuestos):
- Utilizar el componente reutilizable `@/components/ui/FormulaCell`.
- Permite al usuario ingresar expresiones matemáticas directas y relativas:
  - Porcentajes: `35%`
  - Operaciones relativas: `+10`, `-5%`, `*1.5`, `/2`
  - Valores absolutos directos: `150.50`
- Incluye feedback visual de validación y cálculo automático del valor final.

---

## 🛠️ 5. Diseño de la Barra de Herramientas (*Toolbar Layout*)

La barra de herramientas de la tabla debe mantener una jerarquía visual consistente:

1. **Lado Izquierdo (`toolbarLeft`)**:
   - **Título y Descripción**: Pasar mediante las props `title` (con `iconName`) y `description`.
   - **Chip de Errores / Desajustes**: Usar `canFilterErrors` + `rowErrorPredicate` para mostrar chips de estado (ej: *"Sin errores (0)"* o chip clickeable con advertencias).
   - Controles de filtrado contextuales adicionales si aplica.

2. **Lado Derecho**:
   - **Búsqueda Global**: `canSearch={true}` con `searchPlaceholder` descriptivo.
   - **Botón de Filtros**: Abre el Drawer de filtros avanzados. Si hay filtros activos, resalta en variante `info` o `default`.
   - **Botón de Exportar CSV**: `canExport={true}` con tooltip y descarga inmediata o modal de confirmación.
   - **Botón Pantalla Completa**: `canExpand={true}` para expandir la tabla sobre toda la pantalla.
   - **Botones de Acción Primaria (`toolbarRight`)**: Siempre situados al **extremo derecho** (ej: botón `<Button variant="info" iconName="plus">Invite user</Button>`).

---

## 🔒 6. Acciones de Fila y Zona de Seguridad

- **Acciones Rápidas en Fila**: La columna de acciones por fila debe limitarse a operaciones no destructivas (ej. botón de edición con ícono `edit`).
- **Eliminación y Acciones Destructivas**:
  - **No** colocar botes de basura directos en cada fila si la entidad es crítica (usuarios, roles, conexiones principales).
  - Incluir una sección **"Zona de Seguridad"** / **"Danger Zone"** dentro del Drawer o modal de edición con fondo de advertencia (`border-danger-main/30 bg-danger-light/10`) y botón de confirmación explícita.

---

## 📝 7. Ejemplo de Referencia Completo

```tsx
import React, { useMemo } from "react";
import { Button } from "caralstable";
import { DataTable, DataTableColumn } from "@/components/ui";

interface MyItem {
  id: string;
  name: string;
  category: string;
  status: "active" | "inactive";
  amount: number;
}

export function MyItemsTable({ items }: { items: MyItem[] }) {
  const categoryOptions = useMemo(() => [
    { label: "Cloud FinOps", value: "Cloud FinOps" },
    { label: "Data & AI", value: "Data & AI" },
  ], []);

  const columns = useMemo<DataTableColumn<MyItem>[]>(() => [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      filterType: "text",
      width: 250,
      cell: ({ value }) => <span className="font-bold text-neutral-900">{value}</span>,
      footer: ({ filteredData }) => (
        <span className="font-bold text-neutral-900">Total: {filteredData.length}</span>
      ),
    },
    {
      id: "category",
      accessorKey: "category",
      header: "Categoría",
      filterType: "select",
      filterSelectOptions: categoryOptions,
      width: 180,
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "Monto ($)",
      filterType: "currency",
      align: "right",
      width: 140,
      cell: ({ value }) => <span className="font-mono font-bold">${Number(value).toFixed(2)}</span>,
    },
  ], [categoryOptions]);

  return (
    <DataTable<MyItem>
      title="Listado de Registros"
      description="Visualiza y administra todos los registros del sistema."
      iconName="database"
      data={items}
      columns={columns}
      keyExtractor={(row) => row.id}
      canSearch={true}
      canFilterColumns={true}
      canExport={true}
      exportFileName="registros_sistema"
      canExpand={true}
      toolbarRight={
        <Button variant="info" iconName="plus" onClick={() => console.log("Nuevo")}>
          Crear Registro
        </Button>
      }
    />
  );
}
```
