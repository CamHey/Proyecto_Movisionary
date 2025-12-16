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

  // paginación
  const currentPage = ref(1)
  const totalPages = ref(1)

  // ✅ request genérico (NO modifica items)
  const request = async (path, extraParams = {}) => {
    if (!API_KEY) throw new Error('No se encontró VITE_TMDB_API_KEY en .env.local')

    const url = new URL(`${BASE_URL}${path}`)
    url.searchParams.set('api_key', API_KEY)
    url.searchParams.set('language', 'es-ES')

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
    return res.json()
  }

  const fetchFromTmdb = async (path, extraParams = {}, { append = false } = {}) => {
    loading.value = true
    error.value = ''

    // si no estamos “cargando más”, reseteamos la lista
    if (!append) {
      items.value = []
      currentPage.value = 1
      totalPages.value = 1
    }

    try {
      const data = await request(path, extraParams)
      const results = data.results || []

      items.value = append ? [...items.value, ...results] : results
      currentPage.value = data.page || 1
      totalPages.value = data.total_pages || 1
    } catch (e) {
      console.error('[useTmdb] Error:', e)
      error.value = e?.message || 'Error al cargar datos de TMDb.'
    } finally {
      loading.value = false
    }
  }

  // Trending (page opcional)
  const fetchTrending = async (page = 1) => {
    mode.value = 'trending'
    lastQuery.value = ''
    await fetchFromTmdb('/trending/movie/week', { page }, { append: page > 1 })
  }

  // Search (page opcional)
  const search = async (query, page = 1) => {
    const q = String(query || '').trim()
    if (!q) return fetchTrending()

    mode.value = 'search'
    lastQuery.value = q
    await fetchFromTmdb(
      '/search/multi',
      { query: q, include_adult: 'false', page },
      { append: page > 1 }
    )
  }

  // ✅ Discover (flexible)
  const discover = async ({ type = 'movie', page = 1, params = {}, genreId = null } = {}) => {
    mode.value = 'discover'
    lastQuery.value = ''

    const path = type === 'tv' ? '/discover/tv' : '/discover/movie'

    const finalParams = {
      page,
      include_adult: 'false',
      sort_by: 'popularity.desc',
      ...params
    }

    // compat: si te pasan genreId directo
    if (genreId && !finalParams.with_genres) {
      finalParams.with_genres = genreId
    }

    await fetchFromTmdb(path, finalParams, { append: page > 1 })
  }

  // ✅ Watch Providers por título (plataformas)
  const getWatchProviders = async (type, id) => {
    const path = type === 'tv'
      ? `/tv/${id}/watch/providers`
      : `/movie/${id}/watch/providers`

    return request(path)
  }

  // ✅ Lista de providers con logo (para barra de logos)
  const getProvidersList = async (type = 'movie', watch_region = 'BO') => {
    return request(`/watch/providers/${type}`, { watch_region })
  }

  // ✅ NUEVO: Videos (para tráiler)
  const getVideos = async (type, id) => {
    const path = type === 'tv'
      ? `/tv/${id}/videos`
      : `/movie/${id}/videos`

    // language es-ES ya está en request(), pero TMDb a veces devuelve mejor con ambos:
    return request(path, { language: 'es-ES' })
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
    discover,

    // extra
    request,
    getWatchProviders,
    getProvidersList,

    // ✅ nuevo
    getVideos
  }
}
