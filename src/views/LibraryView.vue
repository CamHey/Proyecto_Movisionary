<template>
  <section class="page-library">

    <!-- HERO -->
    <section class="hero hero-reviews">
      <div class="container">
        <p class="eyebrow">Películas & Series · Catálogo</p>
        <h1 class="gradient-title">Biblioteca</h1>
        <p class="sub">Explora por tipo, género, año y popularidad.</p>

        <div class="hero-actions">
          <a class="btn btn-primary" @click.prevent="scrollToCatalogo">
            Ver catálogo
          </a>
          <RouterLink class="btn btn-ghost" to="/top">Ver Top 10</RouterLink>
        </div>
      </div>
      <div class="hero-gradient"></div>
    </section>

    <!-- TOOLBAR -->
    <section class="container toolbar" id="catalogo" style="margin-top: 12px;">
      <p class="muted">Catálogo audiovisual (TMDb)</p>

      <button class="btn" type="button" :disabled="btnDisabled" @click="onMore">
        {{ btnText }}
      </button>
    </section>

    <!-- TABLA -->
    <section class="container table-wrap" aria-labelledby="tbl-title">
      <h2 id="tbl-title" class="visually-hidden">Listado de títulos</h2>

      <div class="table-responsive">
        <table class="table" aria-label="Tabla de títulos">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Año</th>
              <th>Puntuación</th>
            </tr>
          </thead>

           <!-- ?Dircetivas -->

          <tbody>
            <tr v-for="row in rows" :key="row.idx">
              <td>{{ row.idx }}</td>
              <td>{{ row.title }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.year }}</td>
              <td>{{ row.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="loading" class="muted" style="margin-top:1rem;">Cargando…</p>
      <p v-if="error" class="muted error">{{ error }}</p>
    </section>

    <!-- SUGERENCIAS ALEATORIAS -->
    <section class="container" style="margin-top: 32px;">
      <h2>Te puede gustar</h2>
      <p class="muted">Selección aleatoria desde TMDb:</p>

      <div class="grid-mini"
        :style="sugHover ? 'box-shadow:0 0 14px var(--brand1)' : ''"
        @mouseover="sugHover = true"
        @mouseout="sugHover = false"
      >
        <article
          class="mini"
          v-for="s in suggestions"
          :key="s.id"
        >
          <strong>{{ s.title }}</strong><br>
          <span class="muted">
            {{ s.type }} · ⭐ {{ s.score }}
          </span>
        </article>
      </div>
    </section>

  </section>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import useTmdb from '/src/composables/useTmdb.js'

// =======================================================
// TMDb
// =======================================================
const {
  items,
  loading,
  error,
  discover,
  currentPage,
  totalPages
} = useTmdb()

const selectedType = ref('movie') // 'movie' o 'tv'
const page = ref(1)

// =======================================================
// FILAS DE TABLA
// =======================================================
const rows = computed(() =>
  items.value.map((it, i) => {
    const isTv = !!it.first_air_date
    const year = (it.release_date || it.first_air_date || '').slice(0, 4)

    return {
      idx: i + 1,
      title: it.title || it.name,
      type: isTv ? 'Serie' : 'Película',
      year: year || '—',
      score: it.vote_average ? it.vote_average.toFixed(1) : '—'
    }
  })
)

// =======================================================
// BOTÓN CARGAR MÁS
// =======================================================
const btnDisabled = computed(
  () => loading.value || currentPage.value >= totalPages.value
)

const btnText = computed(() => {
  if (loading.value) return 'Cargando...'
  if (currentPage.value >= totalPages.value) return 'No hay más'
  return 'Cargar más'
})

// primera carga
const loadFirstPage = () => {
  page.value = 1
  discover({ type: selectedType.value, page: page.value })
}

// siguiente página
const onMore = () => {
  if (currentPage.value >= totalPages.value) return
  page.value++
  discover({ type: selectedType.value, page: page.value })
}

// =======================================================
// SUGERENCIAS (aleatorias desde TMDb)
// =======================================================
const suggestions = ref([])
const sugHover = ref(false)

const generateSuggestions = () => {
  const arr = [...items.value]
  const n = Math.min(3, arr.length)
  const picks = new Set()

  while (picks.size < n) {
    picks.add(arr[Math.floor(Math.random() * arr.length)])
  }

  suggestions.value = [...picks].map(it => ({
    id: it.id,
    title: it.title || it.name,
    type: it.first_air_date ? 'Serie' : 'Película',
    score: it.vote_average ? it.vote_average.toFixed(1) : '—'
  }))
}

// =======================================================
// SCROLL SUAVE
// =======================================================
function scrollToCatalogo() {
  const el = document.getElementById('catalogo')
  el?.scrollIntoView({ behavior: 'smooth' })
}

// =======================================================
// INIT
// =======================================================
onMounted(async () => {
  await loadFirstPage()
  generateSuggestions()
})
</script>


<style scoped>
.visually-hidden {
  position: absolute;
  left: -9999px;
}
.grid-mini {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.mini {
  padding: .75rem;
  border: 1px solid #ffffff22;
  border-radius: 12px;
  background: #111;
}
.error {
  color: #ff6b6b;
}
</style>
