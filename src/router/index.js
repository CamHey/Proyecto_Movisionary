// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Carga inmediata (home)
import HomeView from '../views/HomeView.vue'


// Lazy imports
const NewsView        = () => import('../views/NewsView.vue')
const ReviewsView     = () => import('../views/ReviewsView.vue')
const LibraryView     = () => import('../views/LibraryView.vue')
const TopView         = () => import('../views/TopView.vue')
const RecommenderView = () => import('../views/RecommenderView.vue')
const KidsView        = () => import('../views/KidsView.vue')
const AboutView       = () => import('../views/AboutView.vue')
const ContactView     = () => import('../views/ContactView.vue')
const MapView         = () => import('../views/MapView.vue')
const TmdbLibraryView = () => import('../views/TmdbLibraryView.vue')
const NotFoundView    = () => import('../views/NotFoundView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/',            name: 'home',         component: HomeView,           meta: { title: 'Inicio' } },
    { path: '/news',        name: 'news',         component: NewsView,           meta: { title: 'Noticias' } },
    { path: '/reviews',     name: 'reviews',      component: ReviewsView,        meta: { title: 'Reseñas' } },
    { path: '/library',     name: 'library',      component: LibraryView,        meta: { title: 'Biblioteca' } },
    { path: '/top',         name: 'top',          component: TopView,            meta: { title: 'Top 10' } },
    { path: '/recommender', name: 'recommender',  component: RecommenderView,    meta: { title: 'Recomendador' } },
    { path: '/kids',        name: 'kids',         component: KidsView,           meta: { title: 'Modo Infantil' } },

    // Footer links
    { path: '/about',   name: 'about',   component: AboutView,       meta: { title: 'Acerca de' } },
    { path: '/contact', name: 'contact', component: ContactView,     meta: { title: 'Contacto' } },
    { path: '/map',     name: 'map',     component: MapView,         meta: { title: 'Mapa de streaming' } },
    { path: '/tmdb',    name: 'tmdb',    component: TmdbLibraryView, meta: { title: 'Demo TMDb' } },

    // 404 SIEMPRE AL FINAL
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFoundView, meta: { title: '404' } },
  ],

  // Siempre que cambies de página sube al inicio
  scrollBehavior: () => ({ top: 0 }),
})

// cambia dinámicamente el título de la pestaña
router.afterEach((to) => {
  document.title = `Movisionary — ${to.meta.title ?? 'App'}`
})

export default router
