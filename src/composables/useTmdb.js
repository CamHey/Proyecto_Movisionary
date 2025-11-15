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

  // 🔹 nuevo: para paginación
  const currentPage = ref(1)
  const totalPages = ref(1)

  const fetchFromTmdb = async (
    path,
    extraParams = {},
    { append = false } = {}
  ) => {
    loading.value = true
    error.value = ''

    // si no estamos “cargando más”, reseteamos la lista
    if (!append) {
      items.value = []
      currentPage.value = 1
      totalPages.value = 1
    }

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
      const results = data.results || []

      items.value = append ? [...items.value, ...results] : results
      currentPage.value = data.page || 1
      totalPages.value = data.total_pages || 1
    } catch (e) {
      console.error('[useTmdb] Error al obtener datos:', e)
      error.value = e.message || 'Error al cargar datos de TMDb.'
    } finally {
      loading.value = false
    }
  }

  // 🔹 Trending (lo que ya usabas), ahora con page opcional
  const fetchTrending = async (page = 1) => {
    mode.value = 'trending'
    lastQuery.value = ''
    await fetchFromTmdb(
      '/trending/movie/week',
      { page },
      { append: page > 1 }
    )
  }

  // 🔹 Búsqueda, también con page opcional
  const search = async (query, page = 1) => {
    const q = String(query || '').trim()
    if (!q) {
      return fetchTrending()
    }

    mode.value = 'search'
    lastQuery.value = q
    await fetchFromTmdb(
      '/search/multi',
      {
        query: q,
        include_adult: 'false',
        page
      },
      { append: page > 1 }
    )
  }

  // 🔹 NUEVO: discover para catálogo / recomendador
  // type: 'movie' | 'tv'
  // genreId: id numérico de género (opcional)
  const discover = async ({
    type = 'movie',
    genreId = null,
    page = 1
  } = {}) => {
    mode.value = 'discover'
    lastQuery.value = ''

    const path = type === 'tv' ? '/discover/tv' : '/discover/movie'

    const params = {
      page,
      sort_by: 'popularity.desc',
      include_adult: 'false'
    }

    if (genreId) {
      params.with_genres = genreId
    }

    await fetchFromTmdb(path, params, { append: page > 1 })
  }

  return {
    // estado
    items,
    loading,
    error,
    mode,
    lastQuery,
    currentPage,
    totalPages,
    // acciones
    fetchTrending,
    search,
    discover
  }
}
