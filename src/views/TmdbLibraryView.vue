<!-- src/views/TmdbLibraryView.vue -->
<template>
  <div class="page-tmdb">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Integraciones</p>
        <h1 class="gradient-title">Demo TMDb</h1>
        <p class="sub">Prueba de trending y búsqueda desde la API.</p>

        <!-- ✅ Buscador + Favoritos (misma fila) -->
        <div class="hero-row">
          <!-- Buscador -->
          <div class="tmdb-search">
            <input
              v-model="query"
              @keyup.enter="onSearch"
              type="text"
              placeholder="Buscar películas o series…"
              aria-label="Buscar contenido en TMDb"
            />
            <button class="btn btn-primary" @click="onSearch">Buscar</button>
          </div>

          <!-- Favoritos (panel derecha) -->
          <aside class="fav-panel" aria-label="Favoritos">
            <div class="fav-head">
              <span class="fav-title">Favoritos</span>
              <span class="fav-count">{{ favIds.length }}</span>
            </div>

            <p v-if="favLoading" class="fav-state">Cargando…</p>
            <p v-else-if="!favMovies.length" class="fav-state">
              Aún no tienes favoritos.
            </p>

            <div v-else class="fav-list">
              <div v-for="m in favMovies" :key="m.id" class="fav-row">
                <RouterLink class="fav-item" :to="`/movie/${m.id}`" :title="m.title">
                  <img
                    :src="smallPoster(m.poster_path)"
                    :alt="m.title"
                    loading="lazy"
                    width="48"
                    height="72"
                  />
                </RouterLink>

                <div class="fav-info">
                  <RouterLink class="fav-name" :to="`/movie/${m.id}`">{{ m.title }}</RouterLink>
                  <button class="fav-remove" @click.prevent="removeFav(m.id)">Quitar</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Contenido -->
    <main class="container">
      <!-- Estados -->
      <p v-if="loading" class="state-msg">Cargando…</p>
      <p v-if="error" class="state-msg error">⚠ {{ error }}</p>

      <!-- ✅ Grid con animación + solo pelis/series con póster -->
      <TransitionGroup
        name="grid"
        tag="section"
        v-if="results.length"
        class="grid-auto tmdb-grid"
      >
        <TmdbCard v-for="item in results" :key="item.id" :item="item" />
      </TransitionGroup>

      <!-- Empty -->
      <section v-if="!loading && !results.length" class="empty-state">
        <p>No hay resultados aún.</p>
      </section>
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>© 2025 Movisionary · Demo TMDb</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import useTmdb from '../composables/useTmdb'
import TmdbCard from '../components/TmdbCard.vue'
import { useLocalLists } from '../composables/useLocalLists'

const { items, loading, error, fetchTrending, search } = useTmdb()

const query = ref('')

// ✅ Favoritos desde localStorage (IDs)
const { favorites, toggleFavorite } = useLocalLists()

function removeFav(id) {
  // toggle lo elimina si ya está
  toggleFavorite(id)
  fetchFavMovies()
}

const favIds = computed(() => favorites.value)

// ✅ Traer info mínima de cada favorito (para mostrar posters)
const favMovies = ref([])
const favLoading = ref(false)

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

const smallPoster = (path) => (path ? `https://image.tmdb.org/t/p/w185${path}` : '')

async function fetchFavMovies() {
  favMovies.value = []
  if (!API_KEY || !favIds.value.length) return

  favLoading.value = true
  try {
    const ids = favIds.value.slice(0, 8) // máximo 8 mini posters

    const results = await Promise.all(
      ids.map(async (id) => {
        const url = new URL(`${BASE_URL}/movie/${id}`)
        url.searchParams.set('api_key', API_KEY)
        url.searchParams.set('language', 'es-ES')

        const res = await fetch(url.toString())
        if (!res.ok) return null

        const data = await res.json()
        return { id: data.id, title: data.title, poster_path: data.poster_path }
      })
    )

    favMovies.value = results.filter(Boolean).filter((m) => !!m.poster_path)
  } finally {
    favLoading.value = false
  }
}

// cuando cambian los favoritos, refresca el panel
watch(
  () => favorites.value.slice(),
  fetchFavMovies,
  { immediate: true }
)

// 💡 results: solo películas/series con póster
const results = computed(() =>
  items.value.filter((item) => {
    const isMovieOrTv =
      !item.media_type || item.media_type === 'movie' || item.media_type === 'tv'
    const hasPoster = !!item.poster_path
    return isMovieOrTv && hasPoster
  })
)

// cuando el usuario busca
const onSearch = () => {
  search(query.value)
}

// al entrar a la página, cargar trending
onMounted(() => {
  fetchTrending()
})
</script>

<style scoped>
.tmdb-grid {
  margin-top: 1.5rem;
}

.state-msg {
  margin: 1rem 0;
  font-size: 1rem;
}

.state-msg.error {
  color: #ff7676;
}

/* ✅ Buscador + favoritos alineados */
.hero-row {
  margin-top: 1rem;
  display: flex;
  gap: 14px;
  align-items: center; /* misma altura */
  justify-content: space-between;
  flex-wrap: wrap;
}

.tmdb-search {
  flex: 1;
  min-width: 320px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
}

.tmdb-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 14px;
}

.tmdb-search input::placeholder {
  opacity: 0.7;
}

.tmdb-search .btn {
  border-radius: 14px;
  padding: 10px 14px;
}

/* ✅ Panel favoritos */
.fav-panel {
  width: 290px;
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
}

.fav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.fav-title {
  font-weight: 700;
  font-size: 13px;
  opacity: 0.9;
}

.fav-count {
  font-size: 12px;
  opacity: 0.7;
}

.fav-state {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
}

.fav-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.fav-item {
  display: inline-flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.12s ease;
}

.fav-item:hover {
  transform: translateY(-2px);
}

.fav-item img {
  display: block;
  width: 48px;
  height: 72px;
  object-fit: cover;
}

.fav-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.fav-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.fav-name {
  color: inherit;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.fav-remove {
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.65;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.fav-remove:hover {
  opacity: 1;
  text-decoration: underline;
}

/* ✅ Animación del TransitionGroup */
.grid-enter-active,
.grid-leave-active {
  transition: 0.18s ease;
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
