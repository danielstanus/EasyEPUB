<div align="center">

  <!-- Logo -->
  <img src="assets/icon.svg" alt="EasyEPUB Logo" width="120" height="120" />

# EasyEPUB

### Lector EPUB moderno, inmersivo y multiplataforma para lectura y productividad.

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3" />
    <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Extension%20%7C%20Mobile-green.svg" alt="Platforms" />
    <img src="https://img.shields.io/badge/Style-Material%20Design%203-orange.svg" alt="Style: Material Design 3" />
  </p>

</div>

---

## 📸 Capturas de Pantalla

<div align="center">
  
  <!-- Screenshot 1 -->
  <img src="assets/library.png" alt="Vista de Biblioteca" width="800" />
  <p><em>Vista en cuadrícula elegante para tu biblioteca personal.</em></p>

  <br />

  <!-- Screenshot 2 -->
  <img src="assets/analytics.png" alt="Estadísticas de Lectura" width="800" />
  <p><em>Mide tu progreso con mapa de calor estilo GitHub y contador de rachas.</em></p>

  <br />

  <!-- Screenshot 3 -->
  <img src="assets/darkmode.png" alt="Modo Oscuro Inteligente" width="800" />
  <p><em>Lectura cómoda por la noche cuidando tu vista e imágenes.</em></p>

</div>

---

## ✨ Características Principales

**EasyEPUB** transforma tu experiencia de lectura combinando flexibilidad, estética y rendimiento:

- ☁️ **Sincronización Completa con Google Drive:** Guarda y restaura tanto tus metadatos (progreso, notas, favoritos) como los propios **archivos `.epub`** en tu Drive privado (`appDataFolder`).
- 🎨 **Selector de Fuentes Avanzado:** Buscador integrado con vista previa en tiempo real de cada tipografía y acceso a fuentes del sistema.
- 🔥 **Estadísticas & Hábitos de Lectura:** Visualiza tu constancia con un **Mapa de calor (Heatmap)** estilo GitHub y mantiene tu motivación con el **Contador de rachas (Streaks)**.
- 🧘 **Modo Zen & Audio Ambiental:** Modo de lectura a pantalla completa sin distracciones e integrador de ruido rosa (pink noise) para máxima concentración.
- 📖 **Experiencia de Lectura Adaptativa:** Lectura en página individual o doble página, tabla de contenidos interactiva, extractor de imágenes y resaltador de texto con notas.
- 📚 **Organización de Biblioteca:** Filtra por favoritos, no leídos o en progreso, y reordena tus libros mediante arrastrar y soltar (drag & drop).
- 🌓 **Modo Oscuro Inteligente & Material Design 3:** Interfaz adaptativa con inversión inteligente que protege las ilustraciones de tus libros.
- 🔌 **Web & Extensión de Navegador:** Funciona tanto en el navegador como extensión para Chrome y Firefox.

---

## 🚀 Instalación y Uso

### 🖥️ Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar el servidor de desarrollo del lector (puerto 7127)
pnpm --filter @flow/reader dev
```

### 🧩 Extensión para Navegadores (Chrome / Edge / Firefox)

1. Compilar la extensión:
   ```bash
   # Para Chrome
   pnpm build:ext:chrome

   # Para Firefox
   pnpm build:ext:firefox
   ```
2. Abre `chrome://extensions` en tu navegador.
3. Activa el **Modo de desarrollador** (arriba a la derecha).
4. Haz clic en **Cargar descomprimida** y selecciona la carpeta `apps/extension/dist`.

---

## 🤝 Créditos

**EasyEPUB** es un fork mejorado y evolucionado basado en el proyecto [Flow](https://github.com/pacexy/flow) y [Lumen-Read](https://github.com/Zolangui/Lumen-Read).

---
