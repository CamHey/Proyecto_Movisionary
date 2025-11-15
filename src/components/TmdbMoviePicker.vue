<template>
  <div class="tmdb-picker">
    <label class="field-label">Buscar película en TMDb</label>

    <form class="tmdb-picker__form" @submit.prevent="onSearch">
      <input
        v-model="query"
        type="search"
        class="input tmdb-picker__input"
        placeholder="Escribe el título y presiona Buscar (ej. Spider-Man)"
      />
      <button type="submit" class="btn btn-ghost" :disabled="isLoading">
        {{ isLoading ? 'Buscando…' : 'Buscar' }}
      </button>
    </form>

    <p v-if="error" class="field-error">{{ error }}</p>

    <ul v-if="results.length" class="tmdb-picker__results">
      <li
        v-for="movie in results"
        :key="movie.id"
        class="tmdb-picker__item"
        @click="selectMovie(movie)"
      >
        <img
          v-if="movie.poster_path"
          class="tmdb-picker__thumb"
          :src="`https://image.tmdb.org/t/p/w92${movie.poster_path}`"
          :alt="movie.title || movie.name"
        />
        <div class="tmdb-picker__info">
          <p class="tmdb-picker__title">
            {{ movie.title || movie.name }}
          </p>
          <p class="tmdb-picker__meta">
            {{ (movie.release_date || movie.first_air_date || '').slice(0, 4) || '—' }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['pick'])

const query = ref('')
const results = ref([])
const isLoading = ref(false)
const error = ref('')

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY =
  import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_KEY

async function onSearch() {
  if (!query.value.trim()) return

  if (!API_KEY) {
    error.value = 'Falta configurar la API key de TMDb en .env'
    return
  }

  isLoading.value = true
  error.value = ''
  results.value = []

  try {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(
      query.value
    )}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Error buscando en TMDb')

    const data = await res.json()
    results.value = (data.results || []).slice(0, 6)
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo buscar en TMDb.'
  } finally {
    isLoading.value = false
  }
}

function selectMovie(movie) {
  emit('pick', movie)
  query.value = movie.title || movie.name
  results.value = []
}
</script>

<style scoped>
.tmdb-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.tmdb-picker__form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.tmdb-picker__input {
  flex: 1;
}

.tmdb-picker__results {
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  list-style: none;
  border-radius: 0.75rem;
  background: rgba(10, 12, 25, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.04);
  max-height: 260px;
  overflow-y: auto;
}

.tmdb-picker__item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  align-items: center;
}

.tmdb-picker__item + .tmdb-picker__item {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.tmdb-picker__item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.tmdb-picker__thumb {
  width: 40px;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.tmdb-picker__info {
  display: flex;
  flex-direction: column;
}

.tmdb-picker__title {
  font-size: 0.9rem;
  font-weight: 600;
}

.tmdb-picker__meta {
  font-size: 0.75rem;
  opacity: 0.7;
}

.field-error {
  font-size: 0.8rem;
  color: #ff879b;
}
</style>
