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

      <form class="form-grid" @submit.prevent="run">
        <!-- Género -->
        <label>
          Género
          <select v-model="prefs.genero" required>
            <option value="">— Elige —</option>
            <option v-for="g in generos" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>

        <!-- Mood -->
        <label>
          Mood
          <select v-model="prefs.mood" required>
            <option value="">— Elige —</option>
            <option v-for="m in moods" :key="m" :value="m">{{ m }}</option>
          </select>
        </label>

        <!-- Duración/Formato -->
        <label>
          Duración / Formato
          <select v-model="prefs.duracion" required>
            <option value="">— Elige —</option>
            <option v-for="d in duraciones" :key="d" :value="d">{{ d }}</option>
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
        <strong>{{ prefs.genero }}</strong> ·
        <strong>{{ prefs.mood }}</strong> ·
        <strong>{{ prefs.duracion }}</strong>
      </p>

      <div v-if="results.length" class="grid">
        <article v-for="it in results" :key="it.id" class="card">
          <div class="thumb">
            <img :src="it.img" :alt="it.titulo" loading="lazy" />
          </div>
          <div class="content">
            <h3>{{ it.titulo }}</h3>
            <p class="meta">
              {{ it.tipo }} · {{ it.genero }} · {{ it.anio }} · ⭐ {{ it.score.toFixed(1) }}
            </p>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        <p class="meta">
          No encontramos títulos exactos con esa combinación. Prueba cambiando
          el <b>mood</b> o la <b>duración</b>.
        </p>
      </div>
    </section>

    <!-- Estado vacío inicial (si no ejecutaste) -->
    <section v-else class="panel empty-state">
      <h2 class="panel-title">Próxima integración</h2>
      <p class="meta">Aquí conectaremos el quiz y mostraremos resultados por afinidad.</p>
      <RouterLink class="btn btn-primary" to="/#quiz-panel">Abrir quiz</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

/* ========= Catálogo mínimo (puedes moverlo a /src/data) ========= */
const catalogo = [
  {
    id: 1,
    titulo: 'Dune: Part Two',
    tipo: 'Película',
    genero: 'Ciencia ficción',
    mood: 'Épico / gran escala',
    duracion: 'Película larga (>130)',
    anio: 2024,
    idioma: 'Inglés',
    score: 4.6,
    img: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg'
  },
  {
    id: 2,
    titulo: 'The Bear',
    tipo: 'Serie',
    genero: 'Drama',
    mood: 'Reflexivo / emotivo',
    duracion: 'Serie corta (6–10 ep)',
    anio: 2022,
    idioma: 'Inglés',
    score: 4.7,
    img: 'https://i.redd.it/a-poster-i-designed-for-the-bear-v0-3ivprpd5odfb1.jpg?width=1080&auto=webp'
  },
  {
    id: 3,
    titulo: 'Arcane',
    tipo: 'Serie',
    genero: 'Animación',
    mood: 'Emocionante / adrenalina',
    duracion: 'Serie corta (6–10 ep)',
    anio: 2021,
    idioma: 'Inglés',
    score: 4.9,
    img: 'https://images.justwatch.com/poster/322700683/s718/temporada-1.jpg'
  },
  {
    id: 4,
    titulo: 'Oppenheimer',
    tipo: 'Película',
    genero: 'Drama',
    mood: 'Reflexivo / emotivo',
    duracion: 'Película larga (>130)',
    anio: 2023,
    idioma: 'Inglés',
    score: 4.8,
    img: 'https://www.infobae.com/new-resizer/1ts6qDldBD3hPPHLDxn05ajBqKs=/arc-anglerfish-arc2-prod-infobae/public/VLFHY43STVH3PBSEULWXPRCSIY.jpeg'
  },
  {
    id: 5,
    titulo: 'Spider-Verse',
    tipo: 'Película',
    genero: 'Animación',
    mood: 'Ligero / divertido',
    duracion: 'Película media (100–130)',
    anio: 2023,
    idioma: 'Inglés',
    score: 4.8,
    img: 'https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/a528ec50-cc70-46f0-a2e3-31b279594daa/spider-man-across-the-spider-verse-banner-features-an-epic-number-of-spider-people.jpg'
  },
  {
    id: 6,
    titulo: 'Flow',
    tipo: 'Película',
    genero: 'Ciencia ficción',
    mood: 'Reflexivo / emotivo',
    duracion: 'Película corta (≤100 min)',
    anio: 2024,
    idioma: 'Inglés',
    score: 4.6,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkp9h8pwSaw471-lwrEO8jsy6aqe6ftG_Dxw&s'
  }
]

/* ========= Opciones (coinciden con tus páginas) ========= */
const generos = [
  'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror',
  'Suspenso / Thriller', 'Ciencia ficción', 'Fantasía',
  'Animación', 'Romance', 'Crimen', 'Documental'
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

/* ========= Estado ========= */
const STORAGE_KEY = 'mv_recommender_prefs'
const prefs = ref({ genero: '', mood: '', duracion: '' })
const ran = ref(false) // si ya corrimos búsqueda

/* ========= Cargar desde localStorage o desde el quiz (query) ========= */
const route = useRoute()
onMounted(() => {
  // 1) Query del quiz (p.ej. /recommender?genero=Drama&mood=Reflexivo%20/%20emotivo&duracion=Serie%20corta%20(6%E2%80%9310%20ep))
  const q = route.query
  if (q.genero || q.mood || q.duracion) {
    prefs.value = {
      genero: decode(String(q.genero || '')),
      mood: decode(String(q.mood || '')),
      duracion: decode(String(q.duracion || ''))
    }
    ran.value = true
    return
  }

  // 2) Últimas preferencias
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) prefs.value = JSON.parse(raw)
  } catch {}
})

const decode = (s) => {
  try { return decodeURIComponent(s) } catch { return s }
}

/* ========= Ejecutar recomendación ========= */
function run () {
  ran.value = true
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.value)) } catch {}
}

/* ========= Reset ========= */
function reset () {
  prefs.value = { genero: '', mood: '', duracion: '' }
  ran.value = false
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

/* ========= Motor de recomendaciones =========
   Regla simple: coincidencia fuerte por género y luego afinar por mood/duración.
   - Puntos: +2 género, +1 mood, +1 duración. Ordenamos por score total y rating.
*/
const results = computed(() => {
  if (!ran.value) return []
  const g = prefs.value.genero
  const m = prefs.value.mood
  const d = prefs.value.duracion

  // Puntuar
  const scored = catalogo.map(it => {
    let pts = 0
    if (g && norm(it.genero) === norm(g)) pts += 2
    if (m && norm(it.mood) === norm(m)) pts += 1
    if (d && norm(it.duracion) === norm(d)) pts += 1
    return { ...it, _pts: pts }
  })

  // Mantener solo los que matchean al menos género o uno de los otros campos
  const filtered = scored.filter(it => it._pts > 0)

  // Orden: puntos desc, score desc, año desc
  return filtered.sort((a, b) => (
    b._pts - a._pts ||
    b.score - a.score ||
    b.anio - a.anio
  ))
})

const norm = (s) => String(s).trim().toLowerCase()
</script>
