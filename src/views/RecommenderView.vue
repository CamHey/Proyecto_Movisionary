<!-- src/views/RecommenderView.vue -->
<template>
  <section class="hero">
    <div class="container">
      <p class="eyebrow">Smart picks</p>
      <h1 class="gradient-title">Recomendador</h1>
      <p class="sub">Vienes del quiz: se autocompleta y recomienda automático (TMDb real).</p>
    </div>
    <div class="hero-gradient"></div>
  </section>

  <main class="container">
    <section class="panel" style="margin-bottom:16px;">
      <h2 class="panel-title" style="margin-top:0;">Tus preferencias</h2>

      <!-- ✅ usamos run() del script -->
      <form class="form-grid" @submit.prevent="run(1)">
        <label>
          Tipo
          <select v-model="prefs.tipo" required>
            <option value="">— Elige —</option>
            <option value="movie">Película</option>
            <option value="tv">Serie</option>
          </select>
        </label>

        <label>
          Género
          <select v-model="prefs.genero" required>
            <option value="">— Elige —</option>
            <option v-for="g in generos" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>

        <label>
          Mood
          <select v-model="prefs.mood" required>
            <option value="">— Elige —</option>
            <option v-for="m in moods" :key="m" :value="m">{{ m }}</option>
          </select>
        </label>

        <label>
          Duración / Formato
          <select v-model="prefs.duracion" required>
            <option value="">— Elige —</option>
            <option v-for="d in duraciones" :key="d" :value="d">{{ d }}</option>
          </select>
        </label>

        <label>
          Año
          <select v-model="prefs.anio" required>
            <option value="">— Elige —</option>
            <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
          </select>
        </label>

        <label>
          Idioma
          <select v-model="prefs.idioma" required>
            <option value="">— Elige —</option>
            <option v-for="i in idiomas" :key="i" :value="i">{{ i }}</option>
          </select>
        </label>

        <div class="full" style="display:flex; gap:10px; justify-content:flex-end;">
          <button type="button" class="btn btn-ghost" @click="resetAll">Limpiar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Buscando…' : 'Ver sugerencias' }}
          </button>
        </div>
      </form>

      <p v-if="error" class="meta" style="margin:10px 0 0;">❌ {{ error }}</p>
    </section>

    <section class="panel" v-if="ran">
      <h2 class="panel-title" style="margin-top:0;">Resultados</h2>

      <p class="meta" style="margin:0 0 10px;">
        Para:
        <strong>{{ prefs.tipo === 'tv' ? 'Serie' : 'Película' }}</strong> ·
        <strong>{{ prefs.genero }}</strong> ·
        <strong>{{ prefs.mood }}</strong> ·
        <strong>{{ prefs.duracion }}</strong> ·
        <strong>{{ prefs.anio }}</strong> ·
        <strong>{{ prefs.idioma }}</strong>
      </p>

      <div v-if="viewItems.length" class="grid">
        <article v-for="it in viewItems" :key="it._key" class="card">
          <div class="thumb">
            <img :src="it.poster" :alt="it.title" loading="lazy" />
          </div>
          <div class="content">
            <h3>{{ it.title }}</h3>
            <p class="meta">
              {{ prefs.tipo === 'tv' ? 'Serie' : 'Película' }} · {{ it.year ?? '—' }} · ⭐ {{ it.rating ?? '—' }}
            </p>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="meta">No encontramos títulos con esa combinación. Cambia género/mood y prueba.</p>
      </div>

      <div v-if="viewItems.length" style="display:flex; justify-content:center; margin-top:14px;">
        <button
          class="btn btn-ghost"
          :disabled="loading || currentPage >= totalPages"
          @click="run(currentPage + 1)"
        >
          {{ currentPage >= totalPages ? 'No hay más páginas' : (loading ? 'Cargando…' : 'Cargar más') }}
        </button>
      </div>
    </section>

    <section v-else class="panel empty-state">
      <h2 class="panel-title">Sugerencias según tus gustos</h2>
      <p class="meta">Elije género y tipo para obtener recomendaciones reales de TMDb.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import useTmdb from '../composables/useTmdb'

const route = useRoute()
const { items, loading, error, currentPage, totalPages, discover } = useTmdb()

const ran = ref(false)

const prefs = ref({ tipo:'', genero:'', mood:'', duracion:'', anio:'', idioma:'' })

const generos = [
  'Acción','Aventura','Comedia','Drama','Terror','Suspenso / Thriller',
  'Ciencia ficción','Fantasía','Animación','Romance','Crimen','Documental'
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
const anios = [
  'Muy reciente (2023+)',
  'Reciente (2018–2022)',
  '2000–2017',
  'Clásicos (antes de 2000)',
  'Indiferente'
]
const idiomas = [
  'Español / Latam',
  'Inglés',
  'Coreano',
  'Japonés',
  'Francés',
  'Otro / Indiferente'
]

const MOVIE_GENRES = {
  'Acción': 28, 'Aventura': 12, 'Comedia': 35, 'Drama': 18, 'Terror': 27,
  'Suspenso / Thriller': 53, 'Ciencia ficción': 878, 'Fantasía': 14,
  'Animación': 16, 'Romance': 10749, 'Crimen': 80, 'Documental': 99
}
const TV_GENRES = {
  'Acción': 10759, 'Aventura': 10759, 'Comedia': 35, 'Drama': 18,
  'Terror': 9648, 'Suspenso / Thriller': 9648,
  'Ciencia ficción': 10765, 'Fantasía': 10765,
  'Animación': 16, 'Romance': 18, 'Crimen': 80, 'Documental': 99
}

const norm = (s) =>
  String(s || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

const decodeQ = (v) => {
  if (v == null) return ''
  const raw = Array.isArray(v) ? v[0] : String(v)
  const plusFixed = raw.replace(/\+/g, ' ')
  try { return decodeURIComponent(plusFixed) } catch { return plusFixed }
}

const pickOption = (value, options) => {
  const nv = norm(value)
  if (!nv) return ''
  const exact = options.find(op => norm(op) === nv)
  if (exact) return exact
  const fuzzy = options.find(op => norm(op).includes(nv) || nv.includes(norm(op)))
  return fuzzy || ''
}

const inferTipoFromDuracion = (d) => {
  const nd = norm(d)
  if (nd.includes('serie') || nd.includes('mini')) return 'tv'
  return 'movie'
}

const langCode = (idioma) => {
  const i = norm(idioma)
  if (!i || i.includes('indiferente')) return ''
  if (i.includes('espanol')) return 'es'
  if (i === 'ingles') return 'en'
  if (i === 'coreano') return 'ko'
  if (i === 'japones') return 'ja'
  if (i === 'frances') return 'fr'
  return ''
}

const yearRange = (anioPref) => {
  const a = norm(anioPref)
  if (!a || a.includes('indiferente')) return {}
  if (a.includes('2023')) return { gte: '2023-01-01' }
  if (a.includes('2018')) return { gte: '2018-01-01', lte: '2022-12-31' }
  if (a.includes('2000')) return { gte: '2000-01-01', lte: '2017-12-31' }
  if (a.includes('antes de 2000')) return { lte: '1999-12-31' }
  return {}
}

const runtimeParams = (duracion) => {
  const d = norm(duracion)
  if (!d) return {}
  if (d.includes('≤100') || d.includes('<=100')) return { 'with_runtime.lte': 100 }
  if (d.includes('100') && d.includes('130')) return { 'with_runtime.gte': 100, 'with_runtime.lte': 130 }
  if (d.includes('>130') || d.includes('larga')) return { 'with_runtime.gte': 130 }
  return {}
}

const moodParams = (mood) => {
  const m = norm(mood)
  if (!m) return {}
  if (m.includes('reflexivo')) return { sort_by: 'vote_average.desc', 'vote_count.gte': 200 }
  if (m.includes('emocionante')) return { sort_by: 'vote_count.desc' }
  if (m.includes('oscuro')) return { 'vote_average.gte': 6 }
  return { sort_by: 'popularity.desc' }
}

async function run(page = 1) {
  ran.value = true

  const t = prefs.value.tipo
  const genreId = t === 'tv'
    ? (TV_GENRES[prefs.value.genero] || null)
    : (MOVIE_GENRES[prefs.value.genero] || null)

  const lang = langCode(prefs.value.idioma)
  const yr = yearRange(prefs.value.anio)

  const params = {
    include_adult: 'false',
    ...(genreId ? { with_genres: genreId } : {}),
    ...(lang ? { with_original_language: lang } : {}),
    ...moodParams(prefs.value.mood)
  }

  if (t === 'movie') {
    if (yr.gte) params['primary_release_date.gte'] = yr.gte
    if (yr.lte) params['primary_release_date.lte'] = yr.lte
    Object.assign(params, runtimeParams(prefs.value.duracion))
  } else {
    if (yr.gte) params['first_air_date.gte'] = yr.gte
    if (yr.lte) params['first_air_date.lte'] = yr.lte
  }

  await discover({ type: t, page, params })
}

function resetAll() {
  prefs.value = { tipo:'', genero:'', mood:'', duracion:'', anio:'', idioma:'' }
  ran.value = false
  items.value = []
}

const IMG = 'https://image.tmdb.org/t/p/w500'
const FALLBACK = 'https://via.placeholder.com/500x750?text=No+Poster'

const viewItems = computed(() =>
  (items.value || []).map(it => ({
    _key: `${prefs.value.tipo}-${it.id}`,
    title: it.title || it.name || 'Sin título',
    year: (it.release_date || it.first_air_date || '').slice(0, 4) || null,
    poster: it.poster_path ? `${IMG}${it.poster_path}` : FALLBACK,
    rating: typeof it.vote_average === 'number' ? it.vote_average.toFixed(1) : null
  }))
)

async function hydrateFromQueryAndRun() {
  const q = route.query

  // ✅ compat: si viene del primer view con ?type=movie&genero=...
  const generoQ = decodeQ(q.genero)
  const typeQ = decodeQ(q.type)

  const hasQuiz = q.genero || q.mood || q.duracion || q.anio || q.idioma || q.type
  if (!hasQuiz) return

  const moodQ = decodeQ(q.mood)
  const duracionQ = decodeQ(q.duracion)
  const anioQ = decodeQ(q.anio)
  const idiomaQ = decodeQ(q.idioma)

  // prioridad: type explícito, sino inferir por duración
  prefs.value.tipo = typeQ ? (typeQ === 'tv' ? 'tv' : 'movie') : inferTipoFromDuracion(duracionQ)

  prefs.value.genero = pickOption(generoQ, generos)
  prefs.value.mood = pickOption(moodQ, moods)
  prefs.value.duracion = pickOption(duracionQ, duraciones)
  prefs.value.anio = pickOption(anioQ, anios)
  prefs.value.idioma = pickOption(idiomaQ, idiomas)

  await run(1)
}

onMounted(() => hydrateFromQueryAndRun())
watch(() => route.query, () => hydrateFromQueryAndRun(), { deep: true })
</script>

<style scoped>
.error { color: #ff6b6b; }
</style>
