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
      <p class="muted">Catálogo audiovisual</p>
      <button class="btn" type="button" :disabled="btnDisabled" @click="onMore">
        {{ btnText }}
      </button>
    </section>

    <!-- TABLA (FOR + WHILE) -->
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
              <th>Género</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            <!-- FOR: renderizado incremental -->
            <tr v-for="(it, i) in visibles" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ it.titulo }}</td>
              <td>{{ it.tipo }}</td>
              <td>{{ it.anio }}</td>
              <td>{{ it.genero }}</td>
              <td>{{ it.rating.toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- SUGERENCIAS (DO...WHILE sin repetición) -->
    <section class="container" style="margin-top: 32px;">
      <h2>Te puede gustar</h2>
      <p class="muted">Selección aleatoria (sin repetición):</p>

      <div
        class="grid-mini"
        :style="sugHover ? 'box-shadow:0 0 14px var(--brand1)' : ''"
        @mouseover="sugHover = true"
        @mouseout="sugHover = false"
      >
        <article
          v-for="s in sugerencias"
          :key="s.titulo"
          class="mini"
        >
          <strong>{{ s.titulo }}</strong><br>
          <span class="muted">
            {{ s.tipo }} · {{ s.genero }} · {{ s.anio }} · ⭐ {{ s.rating.toFixed(1) }}
          </span>
        </article>
      </div>
    </section>

  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { movies } from '../data/movie.js'

// ========================
// ESTADO BÁSICO
// ========================
const BATCH = 2
const cursor = ref(0)
const btnDisabled = ref(false)
const btnText = ref('Cargar más')
const sugHover = ref(false)
const visibles = ref([])

// ========================
// ORDENAMIENTO
// ========================
const ordenados = computed(() =>
  [...movies].sort((a, b) => a.titulo.localeCompare(b.titulo))
)

// ========================
// FOR: RENDER POR LOTES
// ========================
function renderBatch(from, count) {
  const to = Math.min(from + count, ordenados.value.length)

  for (let i = from; i < to; i++) {
    visibles.value.push(ordenados.value[i])
  }

  cursor.value = to
}

// ========================
// WHILE: Cargar más
// ========================
function onMore() {
  btnDisabled.value = true
  let pintados = 0

  while (pintados < BATCH && cursor.value < ordenados.value.length) {
    renderBatch(cursor.value, 1)
    pintados++
  }

  if (cursor.value >= ordenados.value.length) {
    btnText.value = 'No hay más'
  } else {
    btnDisabled.value = false
  }
}

// ========================
// DO...WHILE: sugerencias sin repetición
// ========================
const sugerencias = ref([])

function generarSugerencias(n = 3) {
  const picks = new Set()
  const total = Math.min(n, ordenados.value.length)

  if (total === 0) {
    sugerencias.value = []
    return
  }

  do {
    const r = Math.floor(Math.random() * ordenados.value.length)
    picks.add(r)
  } while (picks.size < total)

  sugerencias.value = [...picks].map(i => ordenados.value[i])
}

// ========================
// Navegar al catálogo (scroll suave, sin anchors)
// ========================
function scrollToCatalogo() {
  const el = document.getElementById('catalogo')
  el?.scrollIntoView({ behavior: 'smooth' })
}

// ========================
// INIT
// ========================
onMounted(() => {
  renderBatch(0, BATCH)
  generarSugerencias(3)
})
</script>

<style scoped>
.visually-hidden { position: absolute; left: -9999px }
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
</style>
