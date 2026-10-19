# FITNESTEBAN 4.0 · Cómo publicarla e instalarla

## 0. Antes de nada (2 minutos)
1. **Revoca la clave de Gemini antigua** en https://aistudio.google.com/apikey (estaba escrita en el código viejo) y crea una nueva.
2. Abre tu app ANTIGUA en el móvil → Progreso → **Exportar**. Guarda el archivo `fitnesteban_backup.json`. Es la única forma de pasar tus datos: la app nueva vive en otra dirección y no ve los datos de la vieja.

## 1. Publicarla gratis con HTTPS (GitHub Pages, sin instalar nada)
1. Crea una cuenta en https://github.com (si no la tienes).
2. Botón **New repository** → nombre `fitnesteban` → Public → *Create repository*.
3. En el repositorio vacío: **uploading an existing file** → arrastra TODO el contenido de esta carpeta (index.html, app.js, styles.css, sw.js, manifest.webmanifest y la carpeta `icons`) → *Commit changes*.
   - No subas archivos con tu clave. Esta versión no la lleva dentro: se pega en Ajustes del móvil.
4. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → *Save*.
5. En 1–2 minutos tendrás tu dirección: `https://TU-USUARIO.github.io/fitnesteban/`

## 2. Instalarla en el móvil (Android, Chrome)
1. Abre esa dirección en Chrome.
2. Menú ⋮ → **Instalar aplicación** (o Ajustes de la app → «Instalar en la pantalla de inicio»).
3. Ábrela desde el icono: pantalla completa y funciona **sin conexión** (la IA sí necesita internet).

## 3. Primer arranque
1. Ajustes → **Importar** → elige el `fitnesteban_backup.json` de la app antigua. Se convierte solo.
2. Ajustes → pega tu **nueva clave** de Gemini → *Probar conexión* → *Guardar*.
3. Recomendado: en Google AI Studio / Google Cloud, restringe la clave a la «Generative Language API».

## 4. Actualizar la app más adelante
1. Sube los archivos nuevos al repositorio (sustituyendo los viejos).
2. En `sw.js`, cambia el número de `CACHE` (por ejemplo `fitnesteban-4.0.1`). Si no lo cambias, el móvil seguirá usando la versión guardada.
3. Al abrir la app aparecerá «Hay una versión nueva» → **Actualizar**.

## Importante
- Tus datos están SOLO en el móvil. Si borras los datos de Chrome o desinstalas, se pierden. **Exporta una copia cada semana** (la app te lo recuerda) y guárdala en Drive.
- La copia de seguridad no incluye la clave de Gemini, a propósito.
