# Movisionary (Migración a Vue 3 + Vite)

Plataforma web para descubrir películas y series: noticias, reseñas de la comunidad, recomendador, modo infantil y demo de integración con la API de TMDb.


## Tecnologías

- Vue 3 + Vite
- Vue Router (lazy-loading + scrollBehavior)
- JavaScript (Composition API + composables)
- CSS propio unificado (`src/style.css`)
- API pública de TMDb (The Movie Database)

## Funcionalidades (resumen)

- Exploración de títulos: tendencias, búsqueda y discover (TMDb)
- Estados de carga y error (`loading / error`) + paginación cuando aplica
- Ruta dinámica de detalle: `/movie/:id`
- Favoritos y watchlist con persistencia en `localStorage`
- Comentarios por película persistentes por `tmdbId` (localStorage)
- Reseñas de comunidad + paneles de reseñas
- Noticias y estrenos con filtros (categoría/orden/rango)
- Recomendador "Smart Picks"
- Modo infantil (Kids)
- Mapa conceptual de plataformas de streaming
- Quiz overlay (gamificación)
- SEO básico por ruta (title + meta description)

## Cómo correr el proyecto

1. Instalar dependencias

Ubícate en la carpeta del proyecto y ejecuta:

npm install


Esto descarga todas las dependencias definidas en package.json.

2. (Opcional) Configurar la API de TMDb

Algunas secciones (como reseñas automáticas y la demo TMDb) usan la API pública de The Movie Database.

Crea un archivo .env en la raíz del proyecto.

Añade la variable:

VITE_TMDB_API_KEY=TU_API_KEY_AQUI


Si no se define esta variable, la aplicación sigue funcionando,
pero solo con las reseñas de la comunidad (sin reseñas automáticas desde TMDb).

3. Ejecutar en modo desarrollo

Desde la raíz del proyecto:

npm run dev


Vite mostrará una URL similar a:

Local:   http://localhost:5173/


Abre ese enlace en el navegador para usar Movisionary en modo desarrollo.

4. Generar versión de producción (build)

Si quieres crear la versión optimizada para producción:

npm run build


Opcionalmente, puedes hacer una prueba local del build:

npm run preview

## Rutas principales

- `/` – Inicio (hero, resumen del sitio y quiz rápido)
- `/news` – Noticias y estrenos con filtros por categoría
- `/reviews` – Reseñas automáticas (TMDb) + reseñas de la comunidad
- `/library` – Biblioteca base del catálogo
- `/top` – Top 10
- `/recommender` – Recomendador "Smart Picks" por preferencias
- `/kids` – Modo infantil con interfaz y contenido adaptado
- `/tmdb` – Demo de integración con la API de TMDb
- `/movie/:id` – Detalle dinámico por película
- `/map` – Mapa conceptual de plataformas de streaming
- `/watchlist` – Lista de pendientes (persistente)
- `/about` – Acerca de / objetivo del proyecto
- `/contact` – Formulario de contacto

## Organización del código

Estructura general:

src/
 ├─ assets/          # Imágenes, íconos, etc.
 ├─ components/      # Componentes reutilizables (ReviewCard, TmdbCard, etc.)
 ├─ composables/     # Lógica compartida (useReviews, useTmdb, ...)
 ├─ router/          # Configuración de Vue Router
 ├─ views/           # Vistas principales (HomeView, NewsView, ReviewsView, ...)
 ├─ App.vue          # Shell principal
 └─ main.js          # Punto de entrada de Vue

## Detalles técnicos

- Uso de Vue Router con lazy-loading en la mayoría de vistas.
- Composables como `useReviews` y `useTmdb` para separar la lógica.
- Reseñas de comunidad guardadas en `localStorage`.
- Componentes reutilizables para cards (noticias, reseñas, TMDb).
- Soporte para modo claro/oscuro y modo infantil.


 # Scripts disponibles

Desde la raíz del proyecto:

npm run dev      # Ejecuta el servidor de desarrollo (Vite)
npm run build    # Genera el build de producción
npm run preview  # Sirve localmente el build generado