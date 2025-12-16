// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// Carga inmediata (home)
import HomeView from "../views/HomeView.vue";

// Lazy imports
const NewsView        = () => import("../views/NewsView.vue");
const ReviewsView     = () => import("../views/ReviewsView.vue");
const LibraryView     = () => import("../views/LibraryView.vue");
const TopView         = () => import("../views/TopView.vue");
const RecommenderView = () => import("../views/RecommenderView.vue");
const KidsView        = () => import("../views/KidsView.vue");
const AboutView       = () => import("../views/AboutView.vue");
const ContactView     = () => import("../views/ContactView.vue");
const MapView         = () => import("../views/MapView.vue");
const TmdbLibraryView = () => import("../views/TmdbLibraryView.vue");
const NotFoundView    = () => import("../views/NotFoundView.vue");

// ✅ Detalle por ID
const MovieDetailView = () => import("../views/MovieDetailView.vue");

// ✅ NUEVO: Watchlist
const WatchlistView   = () => import("../views/WatchlistView.vue");

const BASE_TITLE = "Movisionary";
const DEFAULT_DESC =
  "Descubre películas y series, guarda favoritos, escribe reseñas y recibe recomendaciones personalizadas.";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: "/",            name: "home",        component: HomeView,        meta: { title: "Inicio", description: DEFAULT_DESC } },
    { path: "/news",        name: "news",        component: NewsView,        meta: { title: "Noticias", description: "Noticias, estrenos y tendencias del cine y series." } },
    { path: "/reviews",     name: "reviews",     component: ReviewsView,     meta: { title: "Reseñas", description: "Reseñas y calificaciones de la comunidad." } },
    { path: "/library",     name: "library",     component: LibraryView,     meta: { title: "Biblioteca", description: "Explora el catálogo y descubre títulos populares." } },

    // ✅ NUEVO: Watchlist
    {
      path: "/watchlist",
      name: "watchlist",
      component: WatchlistView,
      meta: { title: "Watchlist", description: "Lista de pendientes con casillas para marcar si ya la viste." },
    },

    { path: "/top",         name: "top",         component: TopView,         meta: { title: "Top 10", description: "Selecciones top y ranking de títulos destacados." } },
    { path: "/recommender", name: "recommender", component: RecommenderView, meta: { title: "Recomendador", description: "Recomendaciones basadas en tus gustos y filtros." } },
    { path: "/kids",        name: "kids",        component: KidsView,        meta: { title: "Modo Infantil", description: "Modo familiar con contenido amigable." } },

    // ✅ Detalle
    {
      path: "/movie/:id",
      name: "movie-detail",
      component: MovieDetailView,
      meta: {
        title: "Detalle",
        description: "Detalle del título con favoritos, watchlist, reseñas y VibeAI.",
      },
    },

    // Footer links
    { path: "/about",   name: "about",   component: AboutView,       meta: { title: "Acerca de", description: "Información del proyecto Movisionary." } },
    { path: "/contact", name: "contact", component: ContactView,     meta: { title: "Contacto", description: "Formulario de contacto y enlaces rápidos." } },
    { path: "/map",     name: "map",     component: MapView,         meta: { title: "Mapa de streaming", description: "Mapa y visualización conceptual de plataformas." } },
    { path: "/tmdb",    name: "tmdb",    component: TmdbLibraryView, meta: { title: "Demo TMDb", description: "Exploración de TMDb con búsqueda y resultados." } },

    // 404 SIEMPRE AL FINAL
    { path: "/:pathMatch(.*)*", name: "notfound", component: NotFoundView, meta: { title: "404", description: DEFAULT_DESC } },
  ],

  // Siempre que cambies de página sube al inicio
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (to.hash) {
      return {
        el: to.hash,
        top: 90, // offset por tu header sticky
        behavior: "smooth",
      };
    }

    return { top: 0 };
  },
});

// ✅ SEO: título + meta description
router.afterEach((to) => {
  const title = to.meta?.title ? `${BASE_TITLE} — ${to.meta.title}` : BASE_TITLE;
  document.title = title;

  const desc = to.meta?.description || DEFAULT_DESC;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);
});

export default router;
