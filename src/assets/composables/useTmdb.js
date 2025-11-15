// src/composables/useTmdb.js
import { ref } from 'vue'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export default function useTmdb() {
  const items = ref([])
  const loading = ref(false)
  const error = ref('')
  const mode = ref('trending')
  const lastQuery = ref('')

  const fetchFromTmdb = async (path, extraParams = {}) => {
    loading.value = true
    error.value = ''
    items.value = []

    try {
      if (!API_KEY) {
        throw new Error('No se encontró VITE_TMDB_API_KEY en .env.local')
      }

      const url = new URL(`${BASE_URL}${path}`)
      url.searchParams.set('api_key', API_KEY)
      url.searchParams.set('language', 'es-ES')

      Object.entries(extraParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value)
        }
      })

      const res = await fetch(url.toString())
      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`)
      }

      const data = await res.json()
      items.value = data.results || []
    } catch (e) {
      console.error('[useTmdb] Error al obtener datos:', e)
      error.value = e.message || 'Error al cargar datos de TMDb.'
    } finally {
      loading.value = false
    }
  }

  const fetchTrending = async () => {
    mode.value = 'trending'
    lastQuery.value = ''
    await fetchFromTmdb('/trending/movie/week')
  }

  const search = async (query) => {
    const q = String(query || '').trim()
    if (!q) {
      return fetchTrending()
    }

    mode.value = 'search'
    lastQuery.value = q
    await fetchFromTmdb('/search/multi', {
      query: q,
      include_adult: 'false'
    })
  }

  return {
    items,
    loading,
    error,
    mode,
    lastQuery,
    fetchTrending,
    search
  }
}
