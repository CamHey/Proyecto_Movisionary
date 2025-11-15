<template>
  <div class="page-tmdb">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Integraciones</p>
        <h1 class="gradient-title">Demo TMDb</h1>
        <p class="sub">Prueba de trending y búsqueda desde la API.</p>

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
      </div>
    </section>

    <!-- Contenido -->
    <main class="container">
      <!-- Estados -->
      <p v-if="loading" class="state-msg">Cargando…</p>
      <p v-if="error" class="state-msg error">⚠ {{ error }}</p>

      <!-- Grid -->
      <section v-if="results.length" class="grid-auto tmdb-grid">
        <article v-for="item in results" :key="item.id" class="card">
          <img
            v-if="item.poster_path"
            class="thumb"
            :src="imgUrl(item.poster_path)"
            :alt="item.title || item.name"
          />
          <div class="content">
            <h3>{{ item.title || item.name }}</h3>
            <p class="meta">⭐ {{ item.vote_average }}</p>
          </div>
        </article>
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
import useTmdb from '@/composables/useTmdb'

const { items, loading, error, fetchTrending, search } = useTmdb()

const query = ref('')

// lo que el template usa como "results"
const results = computed(() => items.value)

// helper para las imágenes de TMDb
const imgUrl = (path) => `https://image.tmdb.org/t/p/w500${path}`

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

.tmdb-grid img.thumb {
  width: 100%;
  border-radius: 8px;
}

.state-msg {
  margin: 1rem 0;
  font-size: 1rem;
}

.state-msg.error {
  color: #ff7676;
}
</style>
