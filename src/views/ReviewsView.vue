<!-- src/views/ReviewsView.vue -->
<template>
  <section class="page-reviews">
    <!-- HERO -->
    <section class="hero hero-reviews container hero-reviews-page">

      <p class="eyebrow">Cine &amp; Series · Opinión</p>
      <h1 class="gradient-title">Reseñas de la comunidad</h1>
      <p class="sub">
        Combina reseñas automáticas de títulos populares con opiniones
        escritas por la comunidad.
      </p>
    </section>

    <!-- FILTROS + BUSCADOR SUPERIOR -->
    <section class="filters container filters-row">
      <div class="chips">
        <button
          class="chip"
          :class="{ 'is-active': filter === 'all' }"
          @click="filter = 'all'"
        >
          Todas
        </button>
        <button
          class="chip"
          :class="{ 'is-active': filter === 'drama' }"
          @click="filter = 'drama'"
        >
          Drama
        </button>
        <button
          class="chip"
          :class="{ 'is-active': filter === 'scifi' }"
          @click="filter = 'scifi'"
        >
          Sci-Fi
        </button>
        <button
          class="chip"
          :class="{ 'is-active': filter === 'animation' }"
          @click="filter = 'animation'"
        >
          Animación
        </button>
        <button
          class="chip"
          :class="{ 'is-active': filter === 'thriller' }"
          @click="filter = 'thriller'"
        >
          Thriller
        </button>
      </div>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          type="search"
          class="input"
          placeholder="Buscar reseñas por título (ej. Spider-Man)"
        />
      </div>
    </section>

    <section class="container layout-two-columns">
      <!-- FORMULARIO -->
      <section class="panel review-form">
        <header class="review-form__header">
          <h2>Añadir reseña de la comunidad</h2>
          <p class="review-form__subtitle">
            Busca la película, ajusta la puntuación y comparte tu opinión.
          </p>
        </header>

        <!-- Buscador TMDb -->
        <TmdbMoviePicker @pick="onPickMovieFromTmdb" />

        <form @submit.prevent="onSubmit" class="review-form__body">
          <div class="form-grid">
            <div class="field">
              <span class="field-label">Título</span>
              <input
                v-model="form.title"
                type="text"
                class="input"
                placeholder="Nombre de la película o serie"
              />
            </div>

            <div class="field">
              <span class="field-label">Categoría</span>
              <select v-model="form.cat" class="input">
                <option value="">— Elegir —</option>
                <option value="drama">Drama</option>
                <option value="scifi">Sci-Fi</option>
                <option value="animation">Animación</option>
                <option value="thriller">Thriller</option>
              </select>
              <p class="field-mini-hint">
                Al elegir desde TMDb, se detecta automáticamente.
              </p>
            </div>

            <div class="field">
              <span class="field-label">Tu nombre</span>
              <input
                v-model="form.by"
                type="text"
                class="input"
                placeholder="Opcional"
              />
            </div>

            <div class="field">
              <span class="field-label">Puntuación (0–5)</span>
              <input
                v-model.number="form.score"
                type="number"
                min="0"
                max="5"
                step="0.5"
                class="input"
              />
            </div>
          </div>

          <div class="field field--full">
            <span class="field-label">Reseña</span>
            <textarea
              v-model="form.text"
              rows="4"
              class="input"
              placeholder="Escribe aquí tu opinión…"
            ></textarea>
          </div>

          <input v-model="form.cover" type="hidden" />

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" @click="clearForm">
              Limpiar
            </button>
            <button type="submit" class="btn btn-primary">
              Guardar reseña
            </button>
          </div>
        </form>
      </section>

      <!-- LISTA DE RESEÑAS -->
      <section class="panel review-list">
        <h2>Reseñas encontradas</h2>
        <p class="muted">
          Filtrando por:
          <strong>{{ currentFilterLabel }}</strong>
          <span v-if="search"> · “{{ search }}”</span>
        </p>

        <p v-if="loading" class="muted" style="margin-top: 0.75rem;">
          Cargando reseñas automáticas…
        </p>
        <p v-if="error" class="field-error" style="margin-top: 0.75rem;">
          {{ error }}
        </p>

        <div
          v-if="!loading && !list.length"
          class="empty-state"
          style="margin-top: 1rem;"
        >
          <p>No hay reseñas que coincidan con la búsqueda.</p>
        </div>

        <section v-if="list.length" class="review-grid">
          <ReviewCard
            v-for="r in list"
            :key="r.id"
            :review="r"
            @toggle-favorite="handleToggleFavorite"
          />
        </section>
      </section>
    </section>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useReviews } from '../composables/useReviews'
import ReviewCard from '../components/ReviewCard.vue'
import TmdbMoviePicker from '../components/TmdbMoviePicker.vue'

const {
  list,
  filter,
  search,
  loading,
  error,
  addReview,
  toggleFavorite
} = useReviews()

const form = ref({
  title: '',
  cat: '',
  by: '',
  score: 3.5,
  text: '',
  cover: ''
})

const currentFilterLabel = computed(() => {
  switch (filter.value) {
    case 'drama':
      return 'Drama'
    case 'scifi':
      return 'Sci-Fi'
    case 'animation':
      return 'Animación'
    case 'thriller':
      return 'Thriller'
    default:
      return 'Todas las categorías'
  }
})

function clearForm() {
  form.value = {
    title: '',
    cat: '',
    by: '',
    score: 3.5,
    text: '',
    cover: ''
  }
}

// TMDb genres → nuestra categoría
function inferCatFromGenres(genreIds = []) {
  if (!Array.isArray(genreIds)) return ''

  if (genreIds.includes(16)) return 'animation'
  if (genreIds.includes(878)) return 'scifi'
  if (genreIds.includes(53)) return 'thriller'
  if (genreIds.includes(18)) return 'drama'

  return ''
}

function onPickMovieFromTmdb(movie) {
  const title = movie.title || movie.name
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : ''

  form.value.title = title
  form.value.cover = poster

  const autoCat = inferCatFromGenres(movie.genre_ids || [])
  if (autoCat) form.value.cat = autoCat
}

function onSubmit() {
  const { title, text } = form.value

  // Solo exigimos título y texto; la categoría se rellena o se pone 'drama'
  if (!title || !text) {
    alert('Completa al menos el título y la reseña.')
    return
  }

  const payload = {
    ...form.value,
    cat: form.value.cat || 'drama' // por si TMDb no detecta nada o no eliges
  }

  addReview(payload)
  clearForm()
}


function handleToggleFavorite(id) {
  toggleFavorite(id)
}
</script>

<style scoped>
.page-reviews .layout-two-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr);
  gap: 1.75rem;
  align-items: flex-start;
}

/* PANEL FORMULARIO */
.review-form {
  border-radius: 1.5rem;
  padding: 1.5rem 1.75rem;
  background: radial-gradient(circle at top left, #131631, #050712 55%);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.review-form__header {
  margin-bottom: 1.25rem;
}

.review-form__header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.review-form__subtitle {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  opacity: 0.7;
}

.review-form__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 1rem 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.field-mini-hint {
  font-size: 0.7rem;
  opacity: 0.55;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* PANEL LISTA */
.review-list {
  border-radius: 2rem;
  padding: 2rem 2rem;
  background: rgba(5, 7, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.review-list h2 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 900px) {
  .page-reviews .layout-two-columns {
    grid-template-columns: minmax(0, 1fr);
  }

  .review-form,
  .review-list {
    padding: 1.25rem 1.1rem;
  }
}

.review-form :deep(.input) {
  background: rgba(7, 10, 24, 0.98);
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #f9fafb;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
}

.review-form :deep(.input:focus) {
  border-color: rgba(162, 186, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(162, 186, 255, 0.3);
}

.review-form :deep(.input::placeholder) {
  color: rgba(255, 255, 255, 0.45);
}

/* textarea un poco más suave, no tan “pill” */
.review-form :deep(textarea.input) {
  border-radius: 1rem;
  min-height: 110px;
  resize: vertical;
}

/* el input de TMDb también entra aquí, pero si quieres hacerlo
   un pelín más pill, puedes afinarlo así: */
.review-form :deep(.tmdb-picker__input) {
  border-radius: 999px;
}

/* --- Buscador superior dentro de filtros --- */

.filters-row {
  align-items: center;
  justify-content: space-between;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(7, 10, 24, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.06);
  max-width: 280px;
}

.search-icon {
  font-size: 0.85rem;
  opacity: 0.7;
  transform: translateY(1px);
}

/* Este es el input blanco feo 😂 */
.search-bar .input {
  padding-top: 2rem;
  border: none;
  background: transparent;
  color: #f9fafb;
  padding: 0;
  font-size: 0.85rem;
  outline: none;
 
}

.search-bar .input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}




</style>
