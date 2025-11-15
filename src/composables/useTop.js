// src/composables/useTop.js
import { ref } from 'vue'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'

export function useTop() {
  const top = ref([])
  const loading = ref(false)
  const error = ref('')
  const visible = ref(5)

  // ============================================================
  // 🔥 Obtener Top mundial real (películas)
  // ============================================================
  async function loadTop(page = 1) {
    loading.value = true
    error.value = ''

    try {
      const url = `${BASE}/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=${page}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Error al obtener Top 10')

      const data = await res.json()

      // Convertir datos reales
      const mapped = data.results.map(m => ({
        id: m.id,
        title: m.title,
        score: m.vote_average.toFixed(1),
        img: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : null
      }))

      // Guardamos SOLO los primeros 10
      top.value = mapped.slice(0, 10)
    } catch (e) {
      error.value = e.message
      console.error('[useTop TMDb Error]', e)
    } finally {
      loading.value = false
    }
  }

  // ============================================================
  // 🔄 Cargar más (vista incremental)
  // ============================================================
  function loadMore(count = 5) {
    visible.value = Math.min(top.value.length, visible.value + count)
  }

  // ============================================================
  // 🎲 DO-WHILE — Top sorpresa sin repetición
  // ============================================================
  function randomPick(n = 4) {
    const out = []
    const used = new Set()

    if (top.value.length === 0) return out

    do {
      const i = Math.floor(Math.random() * top.value.length)
      if (!used.has(i)) {
        used.add(i)
        out.push(top.value[i])
      }
    } while (out.length < Math.min(n, top.value.length))

    return out
  }

  // Auto cargar Top al iniciar
  loadTop()

  return {
    top,
    visible,
    loading,
    error,
    loadMore,
    randomPick
  }
}
