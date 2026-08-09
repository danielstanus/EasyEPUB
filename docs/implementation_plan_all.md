# Plan de Implementación: Sistema de Sincronización y Almacenamiento en la Nube (Google Drive / Firebase / Supabase)

Actualmente, **Flow** cuenta únicamente con sincronización directa hacia **Dropbox** mediante cookies y llamadas directas a la API de Dropbox, además de exportación/importación local mediante archivos ZIP (`pack`/`unpack`).

Este plan propone diseñar e implementar un **sistema de almacenamiento y sincronización modular (Driver Architecture)** en `apps/reader`, permitiendo al usuario seleccionar entre varias alternativas de la nube (**Google Drive**, **Firebase**, **Supabase** o **Dropbox**) o usar respaldo local.

---

## Comparativa de Alternativas de Almacenamiento

| Proveedor | Datos Sincronizados | Pros | Contras | Recomendación |
|---|---|---|---|---|
| **Google Drive** | Libros (ePub), portadas, marcadores, anotaciones y progreso (`appDataFolder`) | • 15 GB gratuitos por usuario.<br>• Privacidad total (el usuario es dueño de su espacio).<br>• Cero coste de servidor backend. | • Requiere flujo OAuth 2.0 y configuración de Google Cloud Console. | **Ideal para usuarios que quieren propiedad de sus datos sin depender de un servidor central.** |
| **Firebase** | Firestore (anotaciones/progreso) + Storage (archivos ePub) | • Sincronización en tiempo real entre múltiples dispositivos.<br>• Autenticación lista (Google, Email, Anónimo).<br>• Excelente integración con React/Next.js. | • Límite gratuito de 5 GB en Storage.<br>• Requiere proyecto en Firebase Console. | **Ideal si se busca sincronización instantánea estilo Kindle entre laptop y teléfono.** |
| **Supabase** | Postgres (anotaciones/progreso) + Storage (ePubs) | • Alternativa Open Source a Firebase.<br>• Base de datos relacional potente para búsquedas y conflictos.<br>• SDK muy sencillo. | • 1 GB de almacenamiento en tier gratuito. | **Excelente opción Open-Source backend.** |
| **Neon Postgres + S3** | Neon DB (metadata/anotaciones) + Cloudflare R2 / AWS S3 (ePubs) | • Postgres Serverless de alto rendimiento. | • Requiere gestionar 2 servicios distintos (DB + S3) y clave de AWS. | Menos adecuado para app puramente cliente. |

---

## Decisión del Usuario

> [!NOTE]
> **Proveedor Seleccionado**: **Google Drive API v3** (usando `appDataFolder` para sincronización privada de metadatos, progreso, anotaciones y libros ePub entre dispositivos web y móviles).

---

## Open Questions Clarificadas

- **Proveedor**: Google Drive (usando OAuth 2.0 y token de actualización).
- **Alcance**: Sincronización completa de datos (libros, portadas, metadatos, marcadores y anotaciones).


---

## Proposed Changes

### Core Sync Architecture (`apps/reader`)

#### [NEW] [sync/provider.ts](file:///c:/Dev/flow/apps/reader/src/sync/provider.ts)
Definir la interfaz unificada `SyncProvider`:
```typescript
export interface SyncProvider {
  id: 'dropbox' | 'gdrive' | 'firebase' | 'supabase'
  name: string
  isAuthorized(): Promise<boolean>
  authorize(): Promise<void>
  unauthorize(): Promise<void>
  uploadData(books: BookRecord[]): Promise<void>
  downloadData(): Promise<BookRecord[] | null>
  uploadBookFile?(id: string, file: File): Promise<void>
  downloadBookFile?(id: string): Promise<Blob | null>
}
```

#### [NEW] [sync/gdrive.ts](file:///c:/Dev/flow/apps/reader/src/sync/gdrive.ts)
Implementar `GoogleDriveProvider`:
- Usar Google Identity Services (GIS) / OAuth 2.0 client side.
- Usar el scope `https://www.googleapis.com/auth/drive.appdata` (guarda los datos en la carpeta oculta de la app en Google Drive del usuario sin llenar su raíz de Drive).
- Métodos para subir/descargar `data.json` y los binarios `.epub`.

#### [NEW] [sync/firebase.ts](file:///c:/Dev/flow/apps/reader/src/sync/firebase.ts)
Implementar `FirebaseProvider`:
- Autenticación con Firebase Auth (Google Sign-In o Anónimo).
- Guardar `books`, `annotations` y `progress` en Firestore (`users/{uid}/books/{bookId}`).
- Guardar archivos `.epub` en Firebase Storage (`users/{uid}/files/{bookId}.epub`).

#### [MODIFY] [sync.ts](file:///c:/Dev/flow/apps/reader/src/sync.ts)
- Reestructurar el archivo para delegar las operaciones al `SyncProvider` activo guardado en las preferencias del usuario.
- Mantener compatibilidad con `pack()` y `unpack()` para backups ZIP locales.

---

### API Routes (`apps/reader/src/pages/api/`)

#### [NEW] [api/callback/gdrive.ts](file:///c:/Dev/flow/apps/reader/src/pages/api/callback/gdrive.ts)
- Endpoint OAuth para el intercambio de tokens de Google Drive (similar a `/api/callback/dropbox`).

#### [NEW] [api/refresh/gdrive.ts](file:///c:/Dev/flow/apps/reader/src/pages/api/refresh/gdrive.ts)
- Endpoint para refrescar el `access_token` de Google Drive de manera segura con cookies HttpOnly.

---

### UI Componentes (`apps/reader/src/components/`)

#### [MODIFY] [settings.tsx](file:///c:/Dev/flow/apps/reader/src/components/pages/settings.tsx)
- Actualizar el selector de sincronización en `<Synchronization />` para permitir elegir entre:
  - **Dropbox**
  - **Google Drive**
  - **Firebase**
  - **Ninguno / Solo Local**
- Mostrar el estado de autorización, correo del usuario conectado y botón de "Sincronizar ahora".

#### [MODIFY] [locales/en-US.ts](file:///c:/Dev/flow/apps/reader/locales/en-US.ts) (y `es-ES`, `zh-CN`, `ja-JP`, `de-DE`)
- Añadir las cadenas traducidas para los nuevos proveedores de sincronización y los diálogos de autenticación.

---

## Verification Plan

### Automated Tests
- Ejecutar `pnpm lint` y `pnpm build` para asegurar la corrección tipográfica en TypeScript.
- Probar funciones de serialización/deserialización con tests unitarios.

### Manual Verification
1. **Google Drive Integration**:
   - Abrir la app en http://localhost:7127/ -> Ajustes -> Sincronización -> Seleccionar "Google Drive".
   - Hacer clic en "Autorizar", completar el flujo de inicio de sesión de Google.
   - Subir un libro ePub, añadir anotaciones y verificar que se suba a Google Drive (`appDataFolder`).
   - Abrir en otro navegador/ventana de incógnito, conectar Google Drive y presionar "Sincronizar" para verificar la restauración del libro y las notas.
2. **Prueba de Respaldo Local (ZIP)**:
   - Exportar copia de seguridad en formato ZIP y restaurarla para garantizar que la funcionalidad existente no sufra regresiones.
