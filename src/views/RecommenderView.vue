<template>
  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <p class="eyebrow">Smart picks</p>
      <h1 class="gradient-title">Recomendador</h1>
      <p class="sub">Usa el quiz del home o define aquí tus preferencias.</p>
    </div>
  </section>

  <main class="container">

    <!-- Panel de selección -->
    <section class="panel" style="margin-bottom:16px;">
      <h2 class="panel-title" style="margin-top:0;">Tus preferencias</h2>

      <form class="form-grid" @submit.prevent="onFind">
        
        <!-- Tipo -->
        <label>
          Tipo
          <select v-model="prefs.type" required>
            <option value="">— Elige —</option>
            <option value="movie">Película</option>
            <option value="tv">Serie</option>
          </select>
        </label>

        <!-- Género -->
        <label>
          Género
          <select v-model="prefs.genero" required>
            <option value="">— Elige —</option>
            <option v-for="g in generos" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>

        <!-- Mood (solo decorativo, no existe en TMDb) -->
        <label>
          Mood
          <select v-model="prefs.mood" required>
            <option value="">— Elige —</option>
            <option v-for="m in moods" :key="m">{{ m }}</option>
          </select>
        </label>

        <!-- Duración (solo decorativo, no existe en TMDb) -->
        <label>
          Duración / Formato
          <select v-model="prefs.duracion" required>
            <option value="">— Elige —</option>
            <option v-for="d in duraciones" :key="d">{{ d }}</option>
          </select>
        </label>

        <!-- Acciones -->
        <div class="full" style="display:flex; gap:10px; justify-content:flex-end;">
          <button type="button" class="btn btn-ghost" @click="reset">Limpiar</button>
          <button type="submit" class="btn btn-primary">Ver sugerencias</button>
        </div>
      </form>
    </section>

    <!-- Resultados -->
    <section class="panel" v-if="ran">
      <h2 class="panel-title" style="margin-top:0;">Resultados</h2>

      <p class="meta" style="margin:0 0 10px;">
        Coincidencias para:
        <strong>{{ prefs.type === 'movie' ? 'Película' : 'Serie' }}</strong> ·
        <strong>{{ prefs.genero }}</strong> ·
        <strong>{{ prefs.mood }}</strong> ·
        <strong>{{ prefs.duracion }}</strong>
      </p>

      <div v-if="loading" class="meta">Cargando recomendaciones…</div>
      <div v-if="error" class="meta error">⚠ {{ error }}</div>

      <div v-if="results.length" class="grid">
        <article v-for="it in results" :key="it.id" class="card">
          <div class="thumb">
            <img :src="imgUrl(it.poster_path)" :alt="it.title || it.name" loading="lazy" />
          </div>
          <div class="content">
            <h3>{{ it.title || it.name }}</h3>
            <p class="meta">
              ⭐ {{ it.vote_average }}
            </p>
          </div>
        </article>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <p class="meta">Sin coincidencias exactas. Prueba cambiando el género o tipo.</p>
      </div>
    </section>

    <!-- Estado vacío inicial -->
    <section v-else class="panel empty-state">
      <h2 class="panel-title">Sugerencias según tus gustos</h2>
      <p class="meta">Elije género y tipo para obtener recomendaciones reales de TMDb.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import useTmdb from '../composables/useTmdb'

// =============================
// TMDb HOOK
// =============================
const { items, discover, loading, error } = useTmdb()

// =============================
// OPCIONES
// =============================
const generos = [
  'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror', 'Thriller',
  'Ciencia ficción', 'Fantasía', 'Animación', 'Romance', 'Crimen', 'Documental'
]
const moods = [
  'Ligero / divertido',
  'Emocionante / adrenalina',
  'Reflexivo / emotivo',
  'Oscuro / retorcido',
  'Épico / gran escala',
  'Familiar'
]
const duraciones = [
  'Película corta (≤100 min)',
  'Película media (100–130)',
  'Película larga (>130)',
  'Serie corta (6–10 ep)',
  'Mini-serie (3–6 ep)'
]

// =============================
// MAPA TMDB: Género → ID
// =============================
const GENRE_MAP = {
  Acción: 28,
  Aventura: 12,
  Comedia: 35,
  Drama: 18,
  Terror: 27,
  Thriller: 53,
  'Ciencia ficción': 878,
  Fantasía: 14,
  Animación: 16,
  Romance: 10749,
  Crimen: 80,
  Documental: 99
}

// =============================
// ESTADO
// =============================
const prefs = ref({ type: '', genero: '', mood: '', duracion: '' })
const ran = ref(false)

const results = computed(() => items.value)
const imgUrl = (p) => `https://image.tmdb.org/t/p/w500${p}`

// =============================
// ACCIONES
// =============================
function onFind() {
  ran.value = true

  const genreId = GENRE_MAP[prefs.value.genero]
  const type = prefs.value.type || 'movie'

  discover({
    type,
    genreId,
    page: 1
  })
}

function reset() {
  prefs.value = { type: '', genero: '', mood: '', duracion: '' }
  ran.value = false
}

// =============================
// CARGA DESDE QUIZ (si llega con ?genero=...)
// =============================
const route = useRoute()

onMounted(() => {
  const q = route.query
  if (q.genero && q.type) {
    prefs.value = {
      type: q.type,
      genero: q.genero,
      mood: q.mood || '',
      duracion: q.duracion || ''
    }
    onFind()
  }
})
</script>

<style scoped>
.error { color: #ff6b6b; }
</style>
