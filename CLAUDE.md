@AGENTS.md
@.agents/rules/ui-design-guidelines.md
@.agents/rules/data-table-guidelines.md

> Conocimiento migrado desde las conversaciones de Antigravity (sep–oct 2026). Revisar los puntos marcados "(a verificar)".

# Crestone Suite (repo `suite`)

Guía operativa destilada de las conversaciones con Antigravity (28-sep a 09-oct-2026). Ante contradicciones, manda lo más reciente (ya está aplicado aquí).

## 1. Qué es el proyecto

- Demo/prototipo front-end de **Crestone Suite** (Seidor Analytics): hub con varios productos "hijos" (branches): `move`, `preserve`, `accelerate`, `optimize`, `analyze`, `migrate`, `profile`/`profiler` (a verificar el id exacto), más secciones globales Connections, Monitor, Dashboard, Docs, Settings, Profile.
- Es una **demo sin backend**: todos los datos son mock en `data/*.json`. Hay animación de carga artificial de 2 s al entrar a un módulo ("como es una demo de la suite").
- Módulo más desarrollado: **Optimize** (FinOps / costos cloud: AWS, Azure, GCP, Snowflake).
- Diseños en Figma: archivo "Data-Suite" (`fileKey` `BYsq0KuNS5dxyGhlbE3Xxl`). El usuario pasa links con `node-id`; se leen con el MCP de Figma (`get_figma_data`). El repo tiene `FIGMA_MAPPING.md` (contenido no visto en el corpus, a verificar).
- Stack:
  - **Next.js 16** (App Router, Turbopack en `next dev`), React, TypeScript.
  - Tailwind con tokens semánticos propios en `app/globals.css` (sintaxis tipo `text-white!` sugiere Tailwind v4, a verificar).
  - Design system **Caral**: paquete `caralstable` (`Button`, `Tabs`, `Drawer`, `Chip`, `Toggle`, `Brand`, `CaralIcon`) e iconos `iconcaral2`.
  - Lottie para la pantalla de carga (`crestone_motion.json`).
  - Tipografía Poppins (`font-poppins`).
- Despliegue: **GitHub Pages** vía GitHub Actions. Repo `JuanToSeidor/datasuite`, URL pública `https://juantoseidor.github.io/datasuite/`.
- Proyectos hermanos citados como referencia de estilo/patrones: **portal / portal2** (login, menú de avatar, selector de iconos, roles) y **datasync** (script de auditoría Caral).

## 2. Arquitectura y estructura

### Route groups (`app/`)
```
app/
  layout.tsx            RootLayout: <html>, ThemeProvider, LanguageProvider, fuentes, globals.css
  globals.css           tokens Caral + animaciones (p.ej. animate-row-expand)
  (public)/layout.tsx   sin shell de dashboard
  (public)/login/page.tsx
  (suite)/layout.tsx    envuelve en <DashboardLayout/> (Navbar + Sidebar + LoadingScreen)
  (suite)/page.tsx      Home/hub (grid de BranchCard)
  (suite)/[branch]/page.tsx   placeholder de módulos; "use client" + use(params); generateStaticParams()
  (suite)/connections/page.tsx, connections/new/page.tsx
  (suite)/optimize/{page,accounts,distributions,drivers,forecast,advisor}/page.tsx
  (suite)/settings/page.tsx + settings/tabs/{general,users,roles,workspaces,security,license}.tsx
  (suite)/profile/page.tsx + profile/tabs/{preferences,security,integrations}.tsx
  (extra)/layout.tsx    reservado para vistas fuera del dashboard (reportes, embebidos); vacío por ahora
```
- `public` = solo login por ahora; `suite` = todo lo demás; `extra` = lo que surja fuera del dashboard.

### Configuración central
- `config/suite.ts`: lista de branches (`id`, `title`, `color` como `var(--color-...)`, `icon`, `href`, `sidebarSections`), tipos `SidebarSection`/`SidebarItem`, y `defaultSidebarSections` (Home, Connections, Monitor, Dashboard, Docs). Para cambiar el menú de un hijo se edita aquí ("Opción 1: configuración declarativa", elegida por el usuario).
- `next.config.ts`: `output: "export"`, `basePath: "/datasuite"` **solo en GitHub Actions**, `trailingSlash: true`, `images.unoptimized: true`.

### Layout / shell (`components/layout/`)
- `DashboardLayout.tsx`: shell, controla LoadingScreen de 2 s al cambiar de módulo (navegación interna dentro del mismo módulo es instantánea).
- `Sidebar.tsx`: usa `usePathname()`; en `/` muestra secciones globales, dentro de un branch muestra las del hijo + botón "← Suite Principal". Botón activo pinta degradado del color del branch. Botón inferior de workspace toma `color` e `iconName` del workspace seleccionado (`data/workspaces.json`).
- `Navbar.tsx`: `CrestoneLogo` SVG coloreado según branch; título "Crestone Suite" en home ("Suite" en `text-neutral-800`), "Crestone <Hijo>" con color del hijo dentro de un módulo. Incluye `LanguageSelector` y `UserMenu`.
- `UserMenu.tsx`: avatar con menú estilo Portal: `Tabs` Caral para tema (light `sunBright` / dark `sunMoon` / system `pc`), Perfil, Configuración (`/settings`), idioma, versión con `Chip` "Novedades", Cerrar sesión (`variant="danger"`, redirige a `/login`).
- `LanguageSelector.tsx`, `WorkspaceCard.tsx`.
- `components/icons/CrestoneLogo.tsx`: props `size`, `accentColor`, `bodyColor`.
- `components/home/BranchCard.tsx`: fondo `linear-gradient(135deg, color, color-mix(in srgb, color 75%, black))`.
- `components/ui/LoadingScreen.tsx`: Lottie coloreado con el color del branch + "Iniciando Crestone <X>...".

### Contextos
- `contexts/ThemeContext.tsx`: modos `light`/`dark`/`system`, persistencia en `localStorage`, escucha `prefers-color-scheme`; hook `useTheme()` (`toggleDark`, etc.).
- `contexts/LanguageContext.tsx`: `useLanguage()` → `language`, `setLanguage`, `dict`, `languages`, `currentLanguageOption`, `t(keyPath, fallback)`. Persistencia en `localStorage` clave `suite_language`.

### i18n (`locales/`)
- `es.ts` (base), `en.ts`, `pt.ts` tipados con `TranslationDictionary`; `index.ts` exporta y define metadatos (ES/EN/PT). Llegaron a 323 claves sincronizadas.
- Solo textos de UI van al diccionario; los datos mock van a `data/*.json`.

### Componentes UI reutilizables (`components/ui/`, exportados en `components/ui/index.ts`)
- `Input.tsx`: `label`, `detail`/`helperText`, `error`, `iconName` + `iconPosition`, `rightElement` (p.ej. toggle de contraseña), `multiline` + `rows` (renderiza textarea); también exporta `Textarea`.
- `Select.tsx`: dropdown custom (no `<select>` nativo): `rounded-2xl`, `shadow-xl`, check en opción activa, cierre por click exterior; `iconName`/`brand` a nivel select u opción (`data-icon`, `data-brand`), acepta `options` o `<option>` children.
- `IconSelector.tsx`: **modal** estilo Portal ("Seleccionar Ícono"), categorías Tecnología, Journey, Financiero, Build, People, Utilidades, Nature, Arrows, Joins; solo iconos `iconcaral2` monocromos (sin `Brand`, sin "Own Tech", sin toggle monocromático); footer "Quitar ícono / Cancelar / Confirmar"; doble clic selecciona. El trigger es el propio cuadro del icono.
- `DataTable.tsx` (genérico `DataTable<T>`): ver sección 4.
- `FormulaCell.tsx`: celda editable con fórmulas.

### Optimize (`components/optimize/`)
- `CostEvolutionChart.tsx`: barras apiladas (compute/storage/database/other); timeline slider tipo Adobe Premiere (pan con barra central, zoom con handles laterales, mapeo 1:1 con `clientX`); línea `info-main` + badge al inicio de cada año; consolidación automática: ≤72 meses mensual, ≤144 trimestral, ≤288 semestral, >288 anual; menú de vistas rápidas (icono `screenView` ↔ `x`, animación slide 300 ms); maximizar en ventana (`fixed inset-2 sm:inset-4`, backdrop, Esc, bloqueo scroll body; iconos `arrowsMaximize`/`arrowsMinimize`). En vista normal el título es solo "Gráfico Progresivo"; el detalle (driver, rango, píldoras) solo cuando está maximizado. Calcula serie ponderada según driver seleccionado.
- `BudgetGaugeCard.tsx`: gauge radial 270° (`totalArc = circumference*0.75`, `rotate-[135deg]`, track y progreso con `strokeDasharray`), umbrales 0/50/75/90 %.
- `TopServicesCard.tsx`: top 3 servicios/cuentas del driver.
- `accounts/ConsolidatedHeroCard.tsx`, `accounts/AccountCard.tsx`.
- `drivers/DriversTable.tsx`, `DriverAllocationRow.tsx`, `AllocationMultiSlider.tsx`, `NewDriverDrawer.tsx` (`NewDriverModal.tsx` solo re-exporta el drawer).
- `distributions/DistributionsTable.tsx` + `index.ts`: preset sobre `DataTable`.

### Datos mock (`data/`)
- `costEvolution.json` (312 meses 2001–2026), `accounts.json` (30 cuentas: 9 AWS, 8 Azure, 7 GCP, 6 Snowflake; 7–15 años de consumo mensual con desglose compute/storage/database/other y servicios internos por mes), `drivers.json` (8 drivers DRV-01..08), `suiteConnections.json`, `connections.json`, `supportedSources.json`, `users.json`, `roles.json`, `workspaces.json`, `sessions.json`, `tokens.json`. Se importan con `import x from "@/data/x.json"`.

### Reglas para el agente (`.agents/rules/`)
- `ui-design-guidelines.md`: reglas Caral (ver sección 4).
- `data-table-guidelines.md`: estándares para tablas con `DataTable<T>`.

### Scripts (`scripts/`)
- `audit-caral-adoption.mjs`: escanea `app/` y `components/` (.tsx/.ts/.jsx/.js): adopción de `Button/Tabs/Drawer/Toggle`, sintaxis `iconcaral2`, colores semánticos, contraste, clases `dark:` redundantes; ranking de infractores.
- `check-i18n.mjs`: paridad de claves entre locales + detección de textos hardcodeados en JSX y props (`label`, `title`, `placeholder`, `description`); excluye `data/` y `.json`.

### Integraciones
- MCP de Figma en Antigravity: paquete `figma-developer-mcp --stdio` (el `@modelcontextprotocol/server-figma` NO existe en npm, da 404). En Windows lanzar con `cmd.exe /c npx -y figma-developer-mcp --stdio`. Variables: `FIGMA_API_KEY` / `FIGMA_API_TOKEN` (no copiar valores).

## 3. Comandos

```bash
npm run dev            # next dev (Turbopack)
npm run build          # next build -> export estático (out/)
npx tsc --noEmit       # chequeo de tipos (usado como verificación tras cada cambio)
npm run audit:caral    # node scripts/audit-caral-adoption.mjs
npm run check:i18n     # node scripts/check-i18n.mjs
```
- Deploy: `.github/workflows/deploy.yml` construye y publica en Pages en cada push a `main`. En GitHub: Settings > Pages > Source = "GitHub Actions" (una sola vez).
- El workflow usa `npm ci`: `package-lock.json` debe estar sincronizado (correr `npm install` y commitear el lock si cambian deps).
- Login local: `http://localhost:3000/login`; settings: `/settings?tab=...`.

## 4. Convenciones y reglas

### Caral (obligatorio; el usuario lo corrige seguido)
- Siempre componentes de `caralstable`: `<Button variant size iconName>` (nunca `<button>` nativo), `<Chip variant label>` (nunca badges con `<span>`), `<Tabs tabs activeIndex onChange>` para switchers/segmentados, `<Drawer>` para paneles laterales, `<Toggle>`.
- Colores solo con tokens semánticos de `globals.css`: `info`, `success`, `warning`, `danger`, `seidor`, `indigo`, `sakura`, `neutral-*`, `container`, `full` (variantes `-main`, `-light`). Prohibido `emerald-*`, `blue-*`, `slate-*`, `amber-*`, `red-*`, `purple-*` y HEX arbitrarios (`bg-[#...]`). Mapeo: emerald→success, blue→info/seidor, amber→warning, red→danger, purple→indigo.
- No duplicar `dark:` sobre tokens auto-adaptativos (`bg-container`, `text-neutral-900`, `border-neutral-*`).
- Tipografía: títulos `text-neutral-900 font-poppins font-bold`; secundarios `text-neutral-800 text-xs|text-sm`. Prohibido `text-neutral-500/400` sobre fondo claro.
- Iconos: `<CaralIcon name="..."/>` y `<Brand name="..."/>` del catálogo canónico; prop `classname` en minúsculas en `iconcaral2`. Si `CaralIcon` no acepta `className`, envolver en `<span>`.
- Excepción aceptada: logo de Microsoft como SVG inline de 4 cuadrados (no existe en `Brand`).
- Correr `npm run audit:caral` después de crear componentes; el usuario detecta y reclama desvíos.
- Paleta de colores para roles/workspaces (tokens Caral): Seidor `#07153A`, Info `#0191FF`, Success `#44CA9F`, Warning `#F88A00`, Danger `#EF4444`, Indigo `#3C096C`, Sakura `#FF2E8C`, Neutral `#242528`, Light `#E2E8F0`.

### UI / patrones pedidos por el usuario
- Preferir **Drawer** (Caral) sobre modales para crear/editar (cuentas, drivers, usuarios, SMTP, SSO, PAT). Excepción: selector de iconos = modal.
- Tamaños de drawer usados: `sm` (editar usuario), `md` (cuentas/drivers), `lg`/`xl` (SMTP).
- Acciones destructivas: nada de papelera en filas; "Zona de Seguridad"/"Danger Zone" dentro del drawer de edición.
- Cards de roles/workspaces colapsadas por defecto (`expanded...Id = null`); drivers también colapsados.
- Botón de acordeón muta a "Guardar" cuando se detectan cambios, luego "Guardado" y vuelve al chevron (`e.stopPropagation()`).
- Ajustes de porcentaje: barra multisegmento con handles circulares azules arrastrables; lo que suma un segmento lo resta al adyacente; total siempre 100 %; selector de paso 1/5/10/20 %; reordenar arrastrando el icono `arrowsLeftRight`; selector de color por píldora que abre **hacia arriba** (`bottom-full mb-2`).
- Activo del sidebar: match exacto o subruta sin match más específico (evita que `/optimize` quede activo en `/optimize/accounts`).
- Botones extra de toolbar de tabla siempre al extremo derecho; filtros de cabecera siempre a la derecha del texto; buscador y acciones en una misma línea.
- Settings: pestañas enrutadas por query `?tab=` (`router.push`, envuelto en `<Suspense>`).
- Idioma de la UI: textos vía diccionario (`dict`/`t()`), nunca hardcodeados; datos mock en JSON. Comunicación con el usuario en español.

### DataTable<T> (ver `.agents/rules/data-table-guidelines.md`)
- Componente agnóstico: **sin datos ni columnas de dominio dentro**; cada página define sus `DataTableColumn<T>[]`: `id`, `header` (texto/nodo/fn), `accessorKey`/`accessorFn`, `cell`, `filterType` (`text|number|currency|select|none`), `filterSelectOptions`, `footer`, `exportValue`, `width`, `minWidth`, `align`, `resizable`, `headerColor`.
- Props: `data`, `columns`, `keyExtractor`, `canSearch`, `canExport` + `exportFileName`, `canExpand`, `canReadjust`, `canFilterColumns`, `canEdit`, `editInRaw` (true = edición en celda; false = columna de acciones por fila que abre drawer; es decisión del desarrollador, no toggle para el usuario), `rowErrorPredicate`/`canFilterErrors`, `title`/`description`/`iconName` (lado izquierdo del toolbar), `toolbarLeft`/`toolbarRight` (aceptan render prop `({ isMaximized }) => ReactNode`), `className` (la sombra `shadow-xl` NO va por defecto; se agrega solo en Optimize/Distributions).
- Drawer de filtros: selector de columna con `Select` (no tabs); columnas tipo lista (`select`) muestran solo chips multiselección con "Seleccionar todas/Limpiar selección"; texto = operador + input (contains, does not contain, equals, does not equal, empty, not empty, starts with, ends with); número/moneda = `=, !=, >, >=, <, <=, between`.
- Fullscreen: `z-[70]` con backdrop `z-[60]` (los Drawer/Modal de Caral usan `z-[100]`/`z-[120]`; con `z-[9999]` quedaban tapados).
- Drawers solo montados cuando están abiertos (si no, reservan altura fantasma).
- Altura: `h-fit`, scroll interno `max-h-[calc(100vh-130px)] overflow-auto`, header y footer sticky, footer compacto `py-2 px-4`.
- Redimensionado: tabla `border-separate border-spacing-0` + `table-fixed`; handles `right-0` dentro de la celda (no en la última columna, generaba scroll horizontal); doble clic restaura ancho; botón `arrowsLeftRight` restaura todos.
- Export CSV: BOM `﻿`, escapado de comas/comillas, nombre dinámico.

## 5. Decisiones tomadas (y descartadas)

- Sidebar por hijo: configuración declarativa en `config/suite.ts` (Opción 1). Descartado: `SidebarContext` con `useSetSidebarItems` (Opción 2).
- Lógica de negocio Optimize: 1) crear cuentas en Accounts → 2) crear drivers con esas cuentas → 3) el dashboard filtra por driver.
- **Drivers** (modelo vigente): nivel general (nombre, código `DRV-xx`, descripción) + cuentas asignadas (agrupan el 100 % del costo, sin % por cuenta) + **entidades** libres escritas por el usuario (p.ej. Norte/Sur/Este o Products/IT/Preventas) con % que suman 100. Descartado: porcentajes por cuenta.
- La pantalla Drivers **no muestra dinero** (solo %); KPI "Cobertura de Prorrateo".
- Edición de driver: reemplaza la fila comprimida (no se muestran ambas); botón `sync` restaura al último `savedSnapshot`; "Add member" abre drawer con cuentas que aún no están en el driver y redistribuye equitativo.
- Accounts: alta en Drawer con Tabs "Credenciales de la Suite" (importa conexiones de `/connections`) vs "Exclusivas" (form propio).
- Dashboard Optimize: el selector de fecha se reemplazó por selector de Drivers ("Todos los Drivers (Consolidado)" por defecto); chart, gauge y top services se recalculan ponderando por driver.
- **Distributions**: filtros en orden Cuenta → Período (mes) → Driver (filtrado por cuenta). Columnas: servicio, categoría, costo facturado, una por entidad del driver, total. Distribution Type (Tabs): `Clean` (todo a 0), `Equaly`, `Proportional`; la edición manual es un botón `edit` aparte junto a expandir. Validación: diferencia ≥ $0.01 entre facturado y prorrateado = error; fila con `bg-warning-light`; chip de errores filtra solo filas con error. Fórmulas en celda: `35%`, `(35%)`, `+0.4`, `-2`, `*1.5`, `/2`, `+10%`, `50+20`; Enter/blur evalúa (2 decimales), Esc cancela. Export: `danger` si todo en 0 (confirma "Los datos están sin completar..."), `warning` si hay errores (confirma), `success` descarga directo.
- Settings vs Profile separados:
  - `/profile` (personal): Preferences (Appearance & Theme, Index page), Security (Password, Active sessions), Integrations (TOTP, PAT).
  - `/settings` (plataforma): General (Parallel Extraction Engine, SMTP, Localization & Regional), Users, Roles, Workspace, Security (SSO Microsoft), License. La pestaña MCP se convirtió en Security (compat `?tab=mcp`).
- Roles: secciones General (nombre, icono, color, descripción multiline, Home Screen), Platform (Connections, Workspaces, User and Role Management, Settings con layout 50/50), Modules, License. Eliminada "MCP & IA integrations". Sin chip "Personalizado"; los de sistema llevan chip "Predeterminado". Sin botón de tuerca.
- Workspaces: mismo patrón que roles, subtabs General/Users, workspace por defecto del sistema con chip.
- PAT: drawer con Capabilities por categoría (Workspaces, Connections, Nodes, Connection metadata, Jobs, Executions and logs) + Workspace scope; prefijo de ejemplo `cst_pat_live_...`; token mostrado una sola vez.
- Users: columnas Usuario, Mail, Departamento, Método de login (Microsoft / Email), Rol, Acciones (solo editar). Botón "Invite user" en `toolbarRight`; `editInRaw={false}` fijo.
- Connections: usa `DataTable`; columna Status eliminada y reemplazada por "Tipo" (Source `info` / Destination `indigo`) con filtro por chips; sin tabs All/Source/Destination; `canExport={false}`; acción = botón icono `edit` ghost centrado, header "ACCIONES"; vista cards oculta en fullscreen.
- Datos duros → `data/*.json`; textos UI → `locales/`.

## 6. Problemas conocidos y soluciones

- **Turbopack panic** "Failed to write app endpoint /[branch]/page ... Next.js package not found": Server Component async importando `Button` de `caralstable`. Fix: `"use client"` + `use(params)`; borrar `.next` y reiniciar si persiste.
- `suiteConfig.icon` tipado `string` vs tipo `Icons` de `CaralIcon`: tipar `icon: Icons` en `config/suite.ts` (o castear).
- Con `output: "export"`, rutas dinámicas necesitan `generateStaticParams()`; el aviso "missing param in generateStaticParams" en dev es transitorio si el build pasa.
- Slider hipersensible: un `useEffect` reescribía el punto de partida en cada render (aceleración compuesta). Usar posición absoluta `clientX` sobre la pista y delta desde el punto inicial del drag.
- Gauge radial: no usar `strokeDasharray="100%"`; ver fórmula en sección 2.
- Errores TS en `Select.tsx`: casteo de props en `React.Children.forEach` y `className` no soportado en `CaralIcon` (envolver en span).
- Runtime en roles tras hot reload: usar optional chaining en permisos (`role.permissions?.connections?.canAdd ?? false`).
- **GitHub Push Protection** bloqueó el push por placeholders con formato de secreto real (Azure client secret en `settings/tabs/security.tsx`, `AKIA...` en placeholder SMTP de `general.tsx`). Usar placeholders genéricos (`azure_client_secret_placeholder_value`); si ya se commiteó, reset suave y recommit limpio.
- `npm ci` falla en Actions por lock desincronizado (`@emnapi/runtime`, `@emnapi/core`): `npm install` local y commitear `package-lock.json`.
- Espacio en blanco bajo tablas: causas combinadas `h-full` + padding duplicado con `<main>` (`p-[20px]`), `<h2>` duplicado fuera de la tabla, drawers cerrados montados, stretch de flex, tooltips invisibles ocupando alto (usar `hidden group-hover:block`). Solución en sección 4.
- Filtros invisibles en fullscreen: z-index (ver sección 4).
- Handles de resize invisibles: `border-collapse` anulaba `absolute` en `th`; usar `border-separate`.
- MCP de Figma 404: paquete incorrecto (sección 2). Si el MCP no responde, los links de Figma requieren auth: pedir captura.

## 7. Estado y pendientes (al 09-oct-2026)

- Hecho: shell suite, Optimize (dashboard, accounts, drivers, distributions), connections con DataTable, login, settings y profile completos en estructura, i18n base ES/EN/PT, scripts de auditoría, deploy a Pages.
- Placeholders sin funcionalidad: `/optimize/forecast`, `/optimize/advisor`, páginas `[branch]` de los otros productos, `(extra)`.
- **En curso**: traducción completa del sitio. El auditor marcaba 35 % (19/54 archivos limpios); el agente anunció que seguiría archivo por archivo (settings, profile, connections, optimize, login, componentes UI) hasta 100 % — no confirmado; correr `npm run check:i18n` para ver el estado real.
- Último cambio: botón de workspace del Sidebar con color/icono del workspace seleccionado.
- Pendiente implícito: mantener `audit:caral` en 0 infracciones y tipos en 0 errores tras cada cambio.

## 8. Glosario

- **Crestone**: marca de la suite de datos de Seidor Analytics; "Crestone Suite" es el hub, cada producto es "Crestone <Hijo>".
- **Branch / hijo**: producto de la suite (Move, Preserve, Accelerate, Optimize, Analyze, Migrate, Profile/Profiler); cada uno tiene color propio (Move azul, Preserve verde, Accelerate naranja, Analyze rosa, Optimize rojo).
- **Caral / caralstable / iconcaral2**: design system de Seidor (componentes React e iconos).
- **Driver / inductor**: agrupación de cuentas cloud cuyo costo se reparte entre entidades por porcentaje.
- **Entidad**: destino del prorrateo de un driver (región, área), definida por el usuario.
- **Prorrateo / distribución**: reparto del costo facturado de cada servicio entre entidades.
- **Accounts**: cuentas cloud (AWS, Azure, GCP, Snowflake) con historial de consumo y servicios internos.
- **Credenciales de la Suite vs Exclusivas**: conexiones compartidas desde `/connections` vs creadas solo para Optimize.
- **PAT**: Personal Access Token (perfil > Integrations).
- **Parallel Extraction Engine / RFCs**: configuración de extracción SAP en paralelo (settings > General).
- **Portal / portal2 / datasync**: otros proyectos del usuario usados como referencia.
