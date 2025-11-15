<!-- src/views/TmdbLibraryView.vue -->
<template>
  <div class="page-tmdb">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Integraciones</p>
        <h1 class="gradient-title">Demo TMDb</h1>
        <p class="sub">Prueba de trending y búsqueda desde la API.</p>

        <!-- Buscador -->
          <!-- TODO: Directivas-->
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
      </div>
    </section>

    <!-- Contenido -->
    <main class="container">
      <!-- Estados -->
        <!-- TODO: Directivas-->
      <p v-if="loading" class="state-msg">Cargando…</p>
      <p v-if="error" class="state-msg error">⚠ {{ error }}</p>

      <!-- Grid (solo pelis/series con póster) -->
      <section v-if="results.length" class="grid-auto tmdb-grid">
        <TmdbCard
          v-for="item in results"
          :key="item.id"
          :item="item"
        />
      </section>

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
import { ref, onMounted, computed } from 'vue'
import useTmdb from '../composables/useTmdb'
import TmdbCard from '../components/TmdbCard.vue'

const { items, loading, error, fetchTrending, search } = useTmdb()

const query = ref('')

// 💡 results: solo películas/series con póster
const results = computed(() =>
  items.value.filter((item) => {
    const isMovieOrTv =
      !item.media_type ||
      item.media_type === 'movie' ||
      item.media_type === 'tv'
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
.tmdb-search {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

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
</style>
