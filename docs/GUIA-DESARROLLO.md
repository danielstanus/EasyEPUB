# Guía de desarrollo — Flow

> Lector de ePubs gratuito y open source (browser-based). Monorepo gestionado con **pnpm** y **Turborepo**.

Este documento explica **qué contiene el proyecto**, **cómo ponerlo en marcha** y **cómo añadir features nuevas sin romper lo que ya funciona**.

---

## 1. Resumen del proyecto

| Ruta | Qué es | Puerta de entrada |
|---|---|---|
| `apps/reader` | **La app principal**: el lector de ePubs (Next.js 12 + React 18) | http://localhost:7127 |
| `apps/website` | Web de marketing / landing (Next.js 12) | http://localhost:7117 |
| `packages/internal` | Utilidades TS/React compartidas (p. ej. `range`) | — |
| `packages/tailwind` | Preset de Tailwind con tokens de diseño (Material 3) | — |
| `packages/epubjs` | Motor de lectura ePub **vendido** (fork de epub.js + tests) | — |

La app se abre en `apps/reader`, que hace todo el trabajo: biblioteca, lectura, búsqueda, anotaciones, temas, tipografía, sincronización con Dropbox y exportación de datos.

---

## 2. Puesta en marcha

### Requisitos

- **Node.js ≥ 18**
- **pnpm** (el repo fija `pnpm@10.6.4`)
- Git

### Instalación

```bash
pnpm install
```

### Variables de entorno — ¡IMPORTANTE!

Cada app necesita su propio `.env.local` (se crea copiando el `.env.local.example` de su carpeta):

```bash
cp apps/reader/.env.local.example  apps/reader/.env.local
cp apps/website/.env.local.example apps/website/.env.local
```

| Archivo | Variable | Necesaria | Para qué sirve |
|---|---|---|---|
| `apps/website/.env.local` | `NEXT_PUBLIC_APP_URL` | **Sí** | URL del lector; la usa el botón "Open App" de la landing |
| `apps/reader/.env.local` | `NEXT_PUBLIC_WEBSITE_URL` | Sí (valor por defecto `http://localhost:7117`) | Enlace de vuelta a la web |
| `apps/reader/.env.local` | `NEXT_PUBLIC_DROPBOX_CLIENT_ID` | No (solo sync) | Sincronización con Dropbox |
| `apps/reader/.env.local` | `DROPBOX_CLIENT_SECRET` | No (solo sync) | Sincronización con Dropbox |

> **Error típico si falta el env:** la landing falla en el arranque con `Failed prop type: The prop href expects a string or object in <Link>, but got undefined instead.` Es porque `OpenApp` lee `process.env.NEXT_PUBLIC_APP_URL` y, sin el `.env.local`, vale `undefined`. Ya se protegió el código con un fallback (`?? '/'`), pero **sin la variable el botón apunta a la web en lugar del lector**.
>
> ⚠️ **Los dev servers de Next.js leen `.env.local` solo al arrancar.** Si cambias variables de entorno, reinicia el server.

### Arrancar

```bash
pnpm dev          # lanza las dos apps en paralelo (turbo)
```

O una sola app:

```bash
pnpm --filter @flow/reader dev
pnpm --filter @flow/website dev
```

- Lector: http://localhost:7127
- Web: http://localhost:7117

> En Windows, si `pnpm dev` dentro de `apps/reader` falla con `"cross-env" no se reconoce`, arranca el reader así:
> `cd apps/reader && RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED=false pnpm exec next dev -p 7127`

### Comandos útiles

```bash
pnpm build                 # build de todos los workspaces
pnpm lint                  # ESLint + checks de Next en todos los workspaces
pnpm --filter @flow/epubjs test   # suite de tests del motor ePub
```

---

## 3. Arquitectura del lector (`apps/reader`)

### Flujo general

1. `pages/index.tsx` (home) muestra la **biblioteca** (libros guardados en IndexedDB).
2. Al abrir un libro, se crea un **`BookTab`** dentro de un **grupo** de pestañas (`models/reader.ts`).
3. `Reader.tsx` monta un `BookPane` que renderiza el ePub en un iframe usando **epub.js** (`packages/epubjs`).
4. La barra lateral muestra **viewlets** (TOC, búsqueda, anotaciones, imágenes, timeline, tipografía, tema).

### Estado global (3 capas, no las mezcles sin motivo)

| Capa | Tecnología | Archivo | Uso |
|---|---|---|---|
| Estado del lector | **valtio** (`proxy` + `useSnapshot`) | `models/reader.ts` | Pestañas y grupos, posición de lectura, resultados de búsqueda, timeline, anotaciones en sesión |
| Estado de UI / ajustes | **recoil** | `state.ts` | `settings` (persistido en localStorage) y `navbarState` |
| Persistencia | **Dexie (IndexedDB)** | `db.ts` | Tablas `books`, `covers`, `files` — versionadas con migraciones |

Puntos clave de `models/reader.ts`:

- `BaseTab` → `BookTab` (libro abierto) y `PageTab` (página interna, p. ej. Settings). `reader.addTab(...)` decide según el tipo.
- `Reader` contiene `groups[]` (ventanas divididas). Cada `Group` tiene `tabs[]` y `selectedIndex`.
- Todo el estado vive en el singleton `reader = proxy(new Reader())`; los componentes leen con `useReaderSnapshot()`.
- Acceso directo desde consola: `window.reader` (solo en cliente).

### Estructura de `src/`

| Carpeta | Contenido |
|---|---|
| `components/base/` | Primitivas: `SplitView`, `PaneView`/`Pane`, `ContextView`, `DropZone`, `GridView`, `ActionBar` |
| `components/viewlets/` | Paneles laterales: `TocView`, `SearchView`, `AnnotationView`, `ImageView`, `TimelineView`, `TypographyView`, `ThemeView` |
| `components/pages/` | Páginas internas (pestañas `PageTab`), p. ej. `settings.tsx` |
| `components/` | `Layout.tsx`, `Reader.tsx`, `Tab.tsx`, `Row.tsx`, `Button.tsx`, `Form.tsx`, `Theme.tsx`, `TextSelectionMenu.tsx`, `Annotation.tsx`, `ErrorBoundary.tsx` |
| `hooks/` | `useLibrary`, `useList` (listas virtualizadas), `useTypography`, `useTranslation`, `useMobile`, `useAction`, `theme/` (color, fondo), `remote/` (Dropbox, sync) |
| `models/` | `reader.ts` (valtio) y `tree.ts` (árbol TOC) |
| `pages/` | Rutas Next: `index.tsx`, `_.tsx` (alias de home), `success.tsx` (callback OAuth), `api/` (refresh/callback Dropbox) |
| raíz de `src/` | `db.ts`, `file.ts` (import/export), `sync.ts` (Dropbox), `annotation.ts`, `color.ts`, `mime.ts`, `platform.ts`, `state.ts`, `styles.ts`, `utils.ts` |

### i18n

- Traducciones en `locales/en-US.ts`, `zh-CN.ts`, `ja-JP.ts`, `de-DE.ts`.
- `useTranslation(scope)` devuelve una función `(key) => string`; la clave real es `scope.key` (sin scope = clave global).
- **Toda cadena visible va aquí y debe añadirse en los 4 idiomas.**

### Estilos

- Tailwind con el preset `packages/tailwind` (tokens Material 3): `text-primary`, `bg-surface`, `typescale-body-medium`, `shadow-1`, `text-on-surface-variant`, `activeClass`/`defaultStyle` desde `styles.ts`, `lock(min, max)` para tamaños fluidos.
- Prettier: **sin punto y coma**, comillas simples, 2 espacios. ESLint extiende Next.

---

## 4. Cómo añadir features sin romper nada

### Reglas de oro

1. **Reutiliza antes de crear**: `Button`, `Row`, `Tab`, `PaneView`/`Pane`, `StateLayer`, `useList` (listas largas), `SplitView` (layouts), `useTranslation` (textos).
2. **Elige bien la capa de estado** (ver tabla del punto 3): valtio para el lector, recoil para UI transitoria, Dexie/localStorage para persistencia.
3. **No toques el esquema de Dexie sin migración**: si añades un campo a `BookRecord` (db.ts), crea `this.version(N).stores({...}).upgrade(...)` manteniendo las versiones anteriores. Borrar o renombrar una tabla/campo **pierde los libros guardados del usuario**.
4. **Nada de `window`/`document`/`localStorage` en render directo** (SSR): úsalos dentro de `useEffect`, event handlers, o con `IS_SERVER` de `@literal-ui/hooks`. El lector monta su contenido solo en cliente (`Layout` espera a `mobile !== undefined`).
5. **Respeta las convenciones**: Prettier + ESLint (`pnpm lint`), componentes PascalCase, hooks `use*`, rutas kebab-case.
6. **No cambies firmas públicas** (exports de `components/index.ts`, `hooks/index.ts`, `models/index.ts`) sin actualizar todas las referencias.
7. **Antes de terminar**: `pnpm build` y `pnpm lint`, y prueba a mano en http://localhost:7127.

### Añadir un viewlet (panel lateral)

1. Crea `components/viewlets/MiViewlet.tsx` usando `PaneView` + `Pane` (mira `TocView.tsx` como plantilla):
   ```tsx
   export const MiViewlet: React.FC<PaneViewProps> = (props) => (
     <PaneView {...props}>
       <Pane headline={t('mi_viewlet.title')}>...</Pane>
     </PaneView>
   )
   ```
2. Regístralo en `viewActions` de `components/Layout.tsx` con su icono (`react-icons/md` o `ri`) y su `env` (`Env.Desktop | Env.Mobile`). Eso lo añade automáticamente a la barra de actividad, la barra móvil y la `SideBar`.
3. Añade `'mi_viewlet.title': '...'` a los **4 locales**.

### Añadir una página/pestaña interna (PageTab)

1. Crea el componente en `components/pages/` (mira `settings.tsx`).
2. Ábrela con `reader.addTab(MiPagina)` — acepta el componente directamente y crea un `PageTab` (título traducido por `t(\`${title}.title\`)`, así que añade la clave a los locales).

### Añadir un ajuste nuevo

1. Añade el campo al tipo `Settings` de `state.ts` (se persiste solo en localStorage).
2. Añade el control en `components/pages/settings.tsx`.
3. Añade las cadenas de UI a los 4 locales.

### Persistir un dato nuevo de un libro

1. Añade el campo a `BookRecord` en `db.ts`.
2. Añade **una nueva versión** con `upgrade` (las versiones existentes no se borran).
3. Actualiza el objeto al guardar (p. ej. `tab.updateBook({ miCampo: valor })`).

### Trabajar con el libro abierto (`BookTab`)

`tab` expone: `rendition` (instancia epub.js), `section`/`sections`, `nav`, `location`, `timeline`, `book` (registro persistido), `display()`, `prev()`/`next()`, `search()`, anotaciones (`putAnnotation`, `removeAnnotation`), definiciones (`define`, `undefine`). Úsalo desde componentes con `useReaderSnapshot()` o `reader.focusedBookTab`.

---

## 5. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| Landing: `href expects a string or object in <Link>, but got undefined` | Falta `NEXT_PUBLIC_APP_URL` en `apps/website/.env.local` | Crear el `.env.local` y **reiniciar** el server |
| El botón "Open App" apunta a `/` | Mismo caso anterior, server arrancado sin la variable | Reiniciar el server con el `.env.local` creado |
| `"cross-env" no se reconoce` (Windows) | El `.bin` de pnpm no está en el PATH del shell | `pnpm --filter @flow/reader dev` desde la raíz, o `pnpm exec next dev -p 7127` con la variable `RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED=false` |
| `Port 7117/7127 is already in use` | Ya hay un dev server en ese puerto | Matar el proceso (`netstat -ano | grep :7117` + `taskkill //PID <pid> //F`) o usar otro puerto con `-p` |
| Warning `GenerateSW has been called multiple times` | PWA (next-pwa) en modo watch | Benigno, ignorar en desarrollo |
| `Browserslist: browsers data is 19 months old` | caniuse-lite desactualizado | `npx update-browserslist-db@latest` (opcional) |

---

## 6. Notas de la puesta a punto actual

- Se crearon `apps/reader/.env.local` y `apps/website/.env.local` (con los valores por defecto de los ejemplos; las claves de Dropbox quedan vacías hasta que registres una app).
- `OpenApp` (web) ahora usa `process.env.NEXT_PUBLIC_APP_URL ?? '/'` para no romper la página si falta la variable.
- Los dos dev servers están arrancados: lector en **7127** y web en **7117**.
