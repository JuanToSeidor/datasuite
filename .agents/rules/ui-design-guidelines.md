# Directrices de Diseño UI y Sistema Visual del Portal

Este documento establece las reglas y estándares de diseño obligatorios para todos los componentes y pantallas del proyecto.

---

## 🎨 1. Paleta de Colores Semántica del Sistema (OBLIGATORIA)

### ⚠️ Regla de Oro: Prohibido usar colores arbitrarios o valores HEX directos en Tailwind
Queda estrictamente prohibido usar:
1. Clases de color directas de Tailwind (ej. `emerald-*`, `blue-*`, `amber-*`, `indigo-*`, `rose-*`, `red-*`, `slate-*`, `zinc-*`).
2. Valores hexadecimales arbitrarios en clases Tailwind (ej. `text-[#869AB5]`, `bg-[#EAF0F6]`, `bg-[#0F172A]`, `text-[#641A1B]`, `bg-[#FDEEED]`).

En su lugar, se **deben** usar únicamente los tokens semánticos definidos en `globals.css`:

| Token Semántico | Fondos (`bg-`) | Bordes (`border-`) | Textos (`text-`) | Uso Intencional |
|---|---|---|---|---|
| **`info`** | `bg-info-main`, `bg-info-light` | `border-info-hard`, `border-info-main` | `text-info-main` | Acciones principales, enlaces activos, foco, navegación |
| **`success`** | `bg-success-main`, `bg-success-light` | `border-success-hard`, `border-success-main` | `text-success-main` | Estados completados, confirmaciones, guardado exitoso |
| **`warning`** | `bg-warning-main`, `bg-warning-light` | `border-warning-hard`, `border-warning-main` | `text-warning-main` | Alertas, estados pendientes, badges "Default", modo súper |
| **`danger`** | `bg-danger-main`, `bg-danger-light` | `border-danger-hard`, `border-danger-main` | `text-danger-main` | Errores, acciones destructivas, botones eliminar |
| **`seidor`** | `bg-seidor-main`, `bg-seidor-light` | `border-seidor-hard` | `text-seidor-main`, `text-seidor-main-text` | Identidad corporativa SEIDOR |
| **`indido`** | `bg-indido-main`, `bg-indido-light` | `border-indido-hard` | `text-indido-main` | Categorías analíticas y badges especiales |
| **`sakura`** | `bg-sakura-main`, `bg-sakura-light` | `border-sakura-hard` | `text-sakura-main` | Destacados y temas especiales |
| **Contenedores** | `bg-container`, `bg-full` | `border-neutral-200`, `border-neutral-300` | - | Fondo de tarjetas, paneles y página completa |

---

## 🌙 2. Comportamiento Dark Mode y Tokens Auto-Dinámicos

### ⚠️ Regla de Oro: No añadir `dark:` a tokens nativos que ya son auto-adaptativos
Los tokens de color `neutral-*`, `container`, `full`, `info-*`, `success-*`, etc. están respaldados por variables CSS dinámicas vinculadas a `caralstable/style.css` y `globals.css` que cambian automáticamente de valor bajo la clase `.dark`.

- ❌ **Incorrecto**: `text-neutral-900 dark:text-white`, `text-neutral-800 dark:text-neutral-300`, `bg-white dark:bg-neutral-900`.
- ✅ **Correcto**: `text-neutral-900`, `text-neutral-800`, `bg-container`, `bg-full`, `border-neutral-200`.

---

## 🔘 3. Uso Obligatorio de Componentes `caralstable` (Botones, Pestañas, Chips y Switchers)

### ⚠️ Regla de Oro: Usar siempre componentes oficiales de `caralstable`
- **Botones**: Usar siempre el componente `<Button />` de `caralstable` (`variant="info" | "light" | "danger" | "success"`, `size="sm" | "md" | "lg"`, `iconName="..."`, `hasBorder`).
- **Badges / Etiquetas de Estado / Links**: Usar siempre el componente `<Chip />` de `caralstable` (`variant="default" | "info" | "success" | "warning" | "danger" | "indido" | "sakura" | "light"`, `label="..."`, `hasBorder`, `iconName="..."`).
  - ❌ **Prohibido**: Crear badges caseros con `<span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">...</span>`.
  - ✅ **Correcto**: `<Chip variant="info" label="Demo" />`, `<Chip variant="light" label="v1.0.0" hasBorder />`, `<Chip variant="warning" label="Super" />`.
- **Pestañas, Sub-vistas y Segmented Controls / Switchers**: Usar siempre el componente `<Tabs />` de `caralstable`.
  - ❌ **Prohibido**: Crear switchers o segmented buttons caseros con `<div className="flex bg-neutral-100 p-1"><button>...</button><button>...</button></div>` para cambiar de idioma (ES/EN), vistas (Cards/Matrix) o temas (Light/Dark).
  - ✅ **Correcto**:
    ```tsx
    <Tabs
      tabs={[
        { label: '🇪🇸 Español' },
        { label: '🇬🇧 English' }
      ]}
      activeIndex={lang === 'es' ? 0 : 1}
      onChange={(idx) => setLang(idx === 0 ? 'es' : 'en')}
    />
    ```
- **Excepción / Notificación**: Si en un caso excepcional se requiere usar un `<button>` HTML nativo (por ejemplo, un botón de arrastre drag-and-drop o un disparador transparente), **se debe justificar expresamente al usuario en la respuesta**.

---

## 🖋️ 4. Contraste de Textos y Tipografía (CRÍTICO)

### ⚠️ Regla de Oro: Prohibido usar `text-neutral-500` / `text-neutral-400` en fondos claros
En fondos como `bg-container`, `bg-full`, o fondos claros, `text-neutral-500` y `text-neutral-400` pierden contraste y se vuelven ilegibles.

- **Títulos y Encabezados**: `text-neutral-900 font-poppins font-bold` / `font-extrabold`
- **Etiquetas de Formularios (`<label>`)**: `text-neutral-900 font-poppins font-semibold text-sm`
- **Textos Secundarios, Subtítulos y Descripciones de Ayuda**: `text-neutral-800 font-poppins text-xs` o `text-sm`
- **Descripciones en Tarjetas / Bento / Módulos**: `text-neutral-800 font-poppins`
- **Badges no seleccionados**: `bg-neutral-100 text-neutral-800 border border-neutral-300`
- **Badges seleccionados**: `bg-info-light text-info-main border border-info-main/30 font-semibold`

---

## 🏷️ 5. Iconografía `iconcaral2`: Lista Canónica y Reglas de Nombres

- **Prop de estilos**: Usar siempre **`classname`** (en minúsculas), NUNCA `className`.

### 📌 Nombres Válidos de `<Brand name="..." />`:
`"AWS"`, `"AzureSql"`, `"GoogleStorage"`, `"SAP"`, `"Saleforce"`, `"Snowflake"`, `"Redshift"`, `"Cloudera"`, `"Teradata"`, `"Google"`, `"Databricks"`, `"AmazonRedshift"`, `"GoogleBigquery"`, `"Teams"`, `"Deepseek"`, `"Gemini"`, `"OpenAI"`, `"SAPHanaC"`, `"S3"`, `"Harbinger"`, `"Doxa"`, `"Daiana"`, `"Crestone"`, `"CloudCosting"`, `"Feelings"`, `"IBMDb2"`, `"MSSQL"`, `"mySQL"`, `"PostgreSQL"`, `"OneDrive"`, `"Sharepoint"`, `"PDF"`, `"DOC"`, `"DOCX"`, `"CSV"`, `"XLSX"`, `"Json"`, `"HTML"`, `"Fabric"`, `"Sybase"`, `"Ollama"`, `"Windows"`, `"DataEngineering"`, `"OneLake"`, `"DataActivator"`, `"DataFactory"`, `"Synapse"`, `"PowerBI"`, `"Database"`, `"IQ"`, `"Dynamics"`, `"Oracle"`, `"Azure"`, `"CloudStorage"`.

### 📌 Nombres Válidos de `<CaralIcon name="..." />`:
- **Navegación y Flechas**: `arrowRight`, `arrowLeft`, `arrowUp`, `arrowDown`, `arrowUpArrowDown`, `arrowsLeftRight`, `arrowsUpDown`, `arrowDownToLine`, `arrowUpToLine`, `arrowsMaximize`, `arrowsMinimize`, `arrowsMove`.
- **Chevrons**: `chevronRigth`, `chevronsRigth`, `chevronRigthCircle`, `chevronRigthBox`, `chevronLeft`, `chevronDown`, `chevronUp`, `closeSidebarLeft`, `closeSidebarRigt`.
- **Acciones y CRUD**: `check`, `plus`, `trash`, `edit`, `copy`, `save`, `x`, `xCircle`, `search`, `sync`, `gear`, `filter`, `eye`, `eyeSlash`, `lock`, `lockOpen`, `cancelExecution`, `continueExecution`.
- **Interfaz y Módulos**: `grid`, `menu`, `dots`, `list`, `bars`, `tab`, `cube`, `city`, `building`, `house`, `user`, `users`, `userConfig`, `shieldHalved`, `star`, `bookmark`, `folder`, `file`, `fileDown`, `chartSimple`, `chartFile`, `charBarScreen`, `presentationScreenChart`, `ligthOn`, `envelope`, `envelopeOpen`, `envelopeSend`, `comments`, `sms`, `message`, `bell`, `calendar`, `clock`, `key`, `database`.
- **Feedback y Estado**: `circleInfo`, `circleCheck`, `clickCheck`, `triangleExclamation`, `like`, `dislike`, `noFound`, `pause`, `play`.

---

## ⚡ 6. Arquitectura y Server Actions (Next.js)

- Todo archivo en `app/actions/` **debe** comenzar con `'use server'` en la primera línea.
- Persistir siempre datos prioritariamente en **Supabase** (`global_config` u otra tabla de la BD) con fallback local en `app/data/*.json`.

---

## 🌐 7. Internacionalización (i18n)

- Utilizar `const { t, language } = useTranslation();`
- Sincronizar siempre textos simultáneamente en [app/locales/es.ts](file:///c:/Users/JuanDavidTorres/Documents/portal/portal2/app/locales/es.ts) y [app/locales/en.ts](file:///c:/Users/JuanDavidTorres/Documents/portal/portal2/app/locales/en.ts).
