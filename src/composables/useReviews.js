// src/composables/useReviews.js
import { ref, computed, onMounted } from 'vue'

const STORAGE_KEY = 'mv_reviews_user_v1'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'

const GENRE_MAP = {
  drama: 18,
  scifi: 878,
  animacion: 16,
  thriller: 53
}

const FAKE_AUTHORS = [
  'Ana M.', 'Luis P.', 'Camila R.', 'Nico S.',
  'Sara G.', 'Fabián L.', 'Valeria M.', 'Pedro D.'
]

const FAKE_TEXTS = [
  'Una propuesta fresca y sorprendente.',
  'Visualmente espectacular, un viaje emocional.',
  'Gran dirección y actuaciones sólidas.',
  'Tiene detalles únicos que la hacen especial.',
  'Una historia atrapante de principio a fin.',
  'Me encantó el ritmo y la narrativa.',
  'Muy recomendable, te mantiene atento.',
  'Buena fotografía y excelente banda sonora.'
]

export function useReviews() {
  const apiItems   = ref([])   // reseñas TMDb
  const userItems  = ref([])   // reseñas comunidad
  const filter     = ref('all')
  const search     = ref('')
  const loading    = ref(false)
  const error      = ref('')

  // =============================
  // 🔁 Cargar reseñas desde TMDb
  // =============================
  async function fetchByGenre(cat, genreId) {
    if (!API_KEY) {
      console.warn('Falta VITE_TMDB_API_KEY, solo reseñas de comunidad.')
      return
    }

    const url = `${BASE}/discover/movie` +
      `?api_key=${API_KEY}` +
      `&language=es-ES` +
      `&sort_by=vote_average.desc` +
      `&with_genres=${genreId}` +
      `&vote_count.gte=500`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error cargando género ${cat}`)

    const data = await res.json()

    const mapped = data.results.slice(0, 6).map(movie => {
      const cover = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null

      return {
        id: `api-${movie.id}-${cat}`,
        movieId: movie.id,
        title: movie.title,
        cover,
        score: Number(movie.vote_average.toFixed(1)),
        by: FAKE_AUTHORS[Math.floor(Math.random() * FAKE_AUTHORS.length)],
        text: FAKE_TEXTS[Math.floor(Math.random() * FAKE_TEXTS.length)],
        cat,                       // 'drama', 'scifi', etc.
        source: 'api',
        favorite: false            // ⭐ estado para el toggle
      }
    })

    apiItems.value.push(...mapped)
  }

  async function initApi() {
    if (!API_KEY) return

    loading.value = true
    error.value   = ''
    apiItems.value = []

    try {
      const entries = Object.entries(GENRE_MAP)
      for (const [cat, gid] of entries) {
        await fetchByGenre(cat, gid)
      }
    } catch (e) {
      console.error('[useReviews TMDb Error]', e)
      error.value = e.message || 'Error al cargar reseñas automáticas'
    } finally {
      loading.value = false
    }
  }

  // =============================
  // 💾 Reseñas de la comunidad
  // =============================
  function loadUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        userItems.value = JSON.parse(raw)
      }
    } catch (e) {
      console.warn('No se pudieron cargar reseñas de usuario', e)
      userItems.value = []
    }
  }

  function saveUser() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userItems.value))
    } catch (e) {
      console.warn('No se pudieron guardar reseñas de usuario', e)
    }
  }

  const addReview = (review) => {
    const id = `user-${Date.now()}`
    userItems.value.push({
      id,
      title: review.title,
      cat: review.cat,
      score: Number(review.score ?? 0),
      by: review.by || 'Anónimo',
      cover: review.cover || '',
      text: review.text || '',
      source: 'user',
      favorite: false            // ⭐ también en reseñas de usuario
    })
    saveUser()
  }

  // ⭐ toggle favorito: busca en userItems y apiItems
  function toggleFavorite(id) {
    let item = userItems.value.find(r => r.id === id)
    let fromUser = true

    if (!item) {
      item = apiItems.value.find(r => r.id === id)
      fromUser = false
    }

    if (item) {
      item.favorite = !item.favorite
      if (fromUser) {
        saveUser()
      }
    }
  }

  // =============================
  // 🎛 Lista combinada + filtros
  // =============================
  const list = computed(() => {
    let base = [...apiItems.value, ...userItems.value]

    if (filter.value !== 'all') {
      base = base.filter(r => r.cat === filter.value)
    }

    const q = search.value.trim().toLowerCase()
    if (q) {
      base = base.filter(r =>
        String(r.title).toLowerCase().includes(q)
      )
    }

    return base
  })

  onMounted(() => {
    loadUser()
    initApi()
  })

  return {
    list,
    filter,
    search,
    loading,
    error,
    addReview,
    toggleFavorite     // export para usar en el padre
  }
}
