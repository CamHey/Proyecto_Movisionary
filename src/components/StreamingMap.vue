<!-- src/components/StreamingMap.vue -->
<template>
  <section class="streaming-live">
    <header class="head">
      <h2>¿Dónde puedo ver este contenido?</h2>
      <p class="meta">
        Mapa conceptual de disponibilidad: para cada película/serie se muestran las
        plataformas de streaming donde está (providers de TMDb por región).
      </p>
    </header>

    <!-- ✅ Logos decorativos en recuadros (NO filtran) -->
    <div class="logos-card card" aria-hidden="true">
      <div class="content logos-inner">
        <div class="logos-strip">
          <span class="logos-label">Plataformas</span>

          <div class="logos-grid">
            <div v-for="p in logoPlatforms" :key="p.name" class="logo-tile" :title="p.name">
              <img :src="p.logo" :alt="p.name" class="logo-img" loading="lazy" />
            </div>
          </div>
        </div>

        <p class="logos-hint">
          * Logos solo decorativos. El filtro real está abajo (chips de texto).
        </p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar card">
      <div class="content">
        <div class="search-row">
          <div class="field">
            <label class="label">Título</label>
            <input
              v-model="query"
              @keyup.enter="onSearch"
              class="input"
              placeholder="Ej: The Office, Dune, Loki…"
            />
          </div>

          <button class="btn btn-primary" @click="onSearch" :disabled="searching">
            {{ searching ? 'Buscando…' : 'Buscar' }}
          </button>
        </div>

        <!-- ✅ Chips de texto (filtro real) -->
        <div class="platform-row" aria-label="Filtrar por plataforma">
          <button
            v-for="p in platformChips"
            :key="p"
            class="chip"
            :class="{ active: selectedPlatform === p }"
            @click="selectedPlatform = p"
            type="button"
          >
            <span class="dot" :class="{ on: selectedPlatform === p }"></span>
            {{ p }}
          </button>
        </div>

        <p class="meta error" v-if="searchError">{{ searchError }}</p>

        <!-- Opciones avanzadas -->
        <details class="advanced">
          <summary>Más opciones</summary>

          <div class="advanced-grid">
            <div class="field">
              <label class="label">Región</label>
              <select v-model="region" class="select">
                <option value="BO">BO (Bolivia)</option>
                <option value="AR">AR (Argentina)</option>
                <option value="US">US (USA)</option>
                <option value="BR">BR (Brasil)</option>
                <option value="CL">CL (Chile)</option>
                <option value="MX">MX (México)</option>
                <option value="ES">ES (España)</option>
              </select>
              <p class="hint">Si BO sale vacío, prueba US/AR.</p>
            </div>

            <div class="field">
              <label class="label">Tipo</label>
              <select v-model="selectedType" class="select">
                <option value="">Todo</option>
                <option value="movie">Películas</option>
                <option value="tv">Series</option>
              </select>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- Resultados -->
    <div class="card">
      <div class="content">
        <div class="results-head">
          <span class="meta">{{ resultsLabel }}</span>
        </div>

        <div class="results">
          <article v-for="item in filteredCatalog" :key="item.id" class="result-card">
            <div class="poster">
              <img v-if="item.poster" :src="item.poster" :alt="item.title" />
              <div v-else class="poster-fallback">🎬</div>
            </div>

            <div class="info">
              <div class="title-row">
                <strong class="title">{{ item.title }}</strong>
                <span class="pill">{{ item.type === 'movie' ? 'Película' : 'Serie' }}</span>
                <span class="year">{{ item.year }}</span>
              </div>

              <!-- ✅ Providers clickeables: abre la plataforma SOLO si está disponible -->
              <div class="providers" aria-label="Plataformas disponibles">
                <button
                  v-for="p in uiPlatforms"
                  :key="p"
                  class="provider"
                  :class="{ on: item.platforms.includes(p) }"
                  type="button"
                  :disabled="!item.platforms.includes(p)"
                  :title="item.platforms.includes(p) ? `Abrir ${p}` : `${p}: no disponible en esta región`"
                  @click="openPlatform(p)"
                >
                  <span class="dot" :class="{ on: item.platforms.includes(p) }"></span>
                  {{ p }}
                </button>

                <span class="meta tiny" v-if="stateOf(item).loading">cargando…</span>
                <span class="meta tiny" v-else-if="stateOf(item).error">sin datos</span>
              </div>

              <!-- ✅ Solo queda Tráiler (si lo quieres, lo dejas) -->
              <div class="actions">
                <button class="btn mini" @click="openTrailer(item)" :disabled="actionsBusy" type="button">
                  Tráiler
                </button>
              </div>
            </div>
          </article>
        </div>

        <p v-if="!filteredCatalog.length && hasSearched" class="meta empty">
          No hay resultados para esos filtros. Prueba otra región (US/AR) o cambia plataforma.
        </p>

        <p v-if="!hasSearched" class="meta empty">
          Escribe un título y presiona “Buscar”.
        </p>
      </div>
    </div>

    <p class="disclaimer">
      * Fuente: TMDb watch/providers (depende de región).
    </p>
  </section>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import useTmdb from '../composables/useTmdb'

const props = defineProps({
  initialTitle: { type: String, default: '' },
  initialPlatform: { type: String, default: 'Todas' },
  initialRegion: { type: String, default: 'BO' }
})

const tmdb = useTmdb()

// UI state
const query = ref(props.initialTitle)
const region = ref(props.initialRegion)
const selectedType = ref('') // '' | movie | tv
const searching = ref(false)
const searchError = ref('')
const hasSearched = ref(false)

// chips (filtro real)
const selectedPlatform = ref(props.initialPlatform)

// evita doble click
const actionsBusy = ref(false)

// sincroniza si cambian params en la URL
watch(
  () => [props.initialTitle, props.initialPlatform, props.initialRegion],
  ([t, p, r]) => {
    query.value = t || ''
    selectedPlatform.value = p || 'Todas'
    region.value = r || 'BO'
  }
)

// plataformas UI
const uiPlatforms = [
  'Netflix',
  'Disney+',
  'Prime Video',
  'HBO Max',
  'Crunchyroll',
  'Apple TV+',
  'Star+'
]

const platformChips = ['Todas', ...uiPlatforms]

// data
const catalog = ref([])
const cache = reactive({})

// logos decorativos
const logoPlatforms = ref([])

const keyFor = (item) => `${item.type}:${item.tmdbId}`
const stateOf = (item) => cache[keyFor(item)] || { loading: false, error: false, loaded: false }

// poster helper
const posterUrl = (path) => (path ? `https://image.tmdb.org/t/p/w342${path}` : '')

// map provider name -> labels
const mapProviderName = (name) => {
  const n = String(name || '').toLowerCase()
  if (n.includes('netflix')) return 'Netflix'
  if (n.includes('disney')) return 'Disney+'
  if (n.includes('prime')) return 'Prime Video'
  if (n === 'max' || n.includes('hbo')) return 'HBO Max'
  if (n.includes('crunchyroll')) return 'Crunchyroll'
  if (n.includes('apple tv')) return 'Apple TV+'
  if (n.includes('star plus') || n === 'star+') return 'Star+'
  return null
}

const normalizePlatforms = (raw) => {
  const r = raw?.results?.[region.value]
  if (!r) return []
  const all = [
    ...(r.flatrate ?? []),
    ...(r.free ?? []),
    ...(r.ads ?? []),
    ...(r.rent ?? []),
    ...(r.buy ?? [])
  ]
  return [...new Set(all.map(p => mapProviderName(p?.provider_name)).filter(Boolean))]
}

const loadProviders = async (item) => {
  const k = keyFor(item)
  if (cache[k]?.loaded) return
  cache[k] = { loading: true, error: false, loaded: false }
  try {
    const raw = await tmdb.getWatchProviders(item.type, item.tmdbId)
    item.platforms = normalizePlatforms(raw)
    cache[k] = { loading: false, error: false, loaded: true }
  } catch {
    item.platforms = []
    cache[k] = { loading: false, error: true, loaded: true }
  }
}

const loadDecorativeLogos = async () => {
  try {
    const [movieList, tvList] = await Promise.all([
      tmdb.getProvidersList('movie', region.value),
      tmdb.getProvidersList('tv', region.value)
    ])

    const all = [...(movieList?.results || []), ...(tvList?.results || [])]

    const wanted = [
      'Netflix',
      'Disney+',
      'Prime Video',
      'HBO Max',
      'Crunchyroll',
      'Apple TV+',
      'Star+'
    ]

    const toLogo = (path) => (path ? `https://image.tmdb.org/t/p/w92${path}` : '')

    const found = {}
    for (const prov of all) {
      const label = mapProviderName(prov?.provider_name)
      if (label && wanted.includes(label) && !found[label] && prov.logo_path) {
        found[label] = toLogo(prov.logo_path)
      }
    }

    logoPlatforms.value = wanted
      .filter((w) => found[w])
      .map((w) => ({ name: w, logo: found[w] }))
  } catch (e) {
    console.warn('No se pudieron cargar logos decorativos', e)
    logoPlatforms.value = []
  }
}

const onSearch = async () => {
  const q = query.value.trim()
  if (!q) return

  hasSearched.value = true
  searching.value = true
  searchError.value = ''
  catalog.value = []
  Object.keys(cache).forEach(k => delete cache[k])

  try {
    await tmdb.search(q, 1)

    const results = (tmdb.items.value || [])
      .filter(r => r && (r.media_type === 'movie' || r.media_type === 'tv'))
      .slice(0, 16)
      .map(r => ({
        id: `${r.media_type}-${r.id}`,
        tmdbId: r.id,
        type: r.media_type,
        title: r.media_type === 'movie' ? r.title : r.name,
        year: (r.release_date || r.first_air_date || '').slice(0, 4) || '—',
        poster: posterUrl(r.poster_path),
        platforms: []
      }))

    const typed = selectedType.value ? results.filter(x => x.type === selectedType.value) : results
    catalog.value = typed

    await Promise.all(typed.map(loadProviders))
  } catch (e) {
    searchError.value = e?.message || 'No se pudo buscar en TMDb.'
  } finally {
    searching.value = false
  }
}

// init logos
loadDecorativeLogos()

watch(region, async () => {
  loadDecorativeLogos()

  if (!catalog.value.length) return
  Object.keys(cache).forEach(k => delete cache[k])
  catalog.value = catalog.value.map(x => ({ ...x, platforms: [] }))
  await Promise.all(catalog.value.map(loadProviders))
})

watch(selectedType, async () => {
  if (!hasSearched.value) return
  await onSearch()
})

const filteredCatalog = computed(() => {
  const plat = selectedPlatform.value
  return catalog.value.filter(item => (plat === 'Todas' ? true : item.platforms.includes(plat)))
})

const resultsLabel = computed(() => {
  const plat = selectedPlatform.value
  const t = selectedType.value === 'movie' ? 'Películas' : selectedType.value === 'tv' ? 'Series' : 'Todo'
  return `Resultados: ${filteredCatalog.value.length} · Tipo: ${t} · Plataforma: ${plat}`
})

/* =========================================================
   ✅ Solo 2 cosas: Tráiler + Abrir plataforma
   ========================================================= */
const openTrailer = async (item) => {
  if (actionsBusy.value) return
  actionsBusy.value = true
  try {
    const data = await tmdb.getVideos(item.type, item.tmdbId)
    const list = data?.results || []

    const yt =
      list.find(v => v.site === 'YouTube' && /trailer/i.test(v.type || '')) ||
      list.find(v => v.site === 'YouTube')

    if (!yt) {
      alert('No se encontró tráiler para este título.')
      return
    }

    window.open(`https://www.youtube.com/watch?v=${yt.key}`, '_blank', 'noopener,noreferrer')
  } catch {
    alert('No se pudo cargar el tráiler.')
  } finally {
    actionsBusy.value = false
  }
}

// ✅ Abre la plataforma para registrarte/iniciar sesión
const platformUrl = (platform) => {
  switch (platform) {
    case 'Netflix': return 'https://www.netflix.com/signup'
    case 'Disney+': return 'https://www.disneyplus.com/'
    case 'Prime Video': return 'https://www.primevideo.com/'
    case 'HBO Max': return 'https://www.max.com/'
    case 'Crunchyroll': return 'https://www.crunchyroll.com/'
    case 'Apple TV+': return 'https://tv.apple.com/'
    case 'Star+': return 'https://www.starplus.com/' // si redirige en tu país, perfecto
    default: return ''
  }
}

const openPlatform = (platform) => {
  const url = platformUrl(platform)
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

// init auto-search
onMounted(() => {
  if (query.value.trim()) onSearch()
})
</script>

<style scoped>
.streaming-live{
  margin-top: 1.25rem;
  display:flex;
  flex-direction:column;
  gap: 1rem;
}

/* Logos decorativos en recuadros */
.logos-card .logos-inner{
  display:flex;
  flex-direction:column;
  gap:.45rem;
}

.logos-strip{
  display:flex;
  align-items:flex-start;
  gap:1rem;
}

.logos-label{
  font-size:.85rem;
  opacity:.8;
  min-width: 110px;
  letter-spacing:.08em;
  text-transform: uppercase;
  padding-top:.35rem;
}

.logos-grid{
  display:flex;
  flex-wrap:wrap;
  gap:.6rem;
  align-items:center;
}

.logo-tile{
  width: 72px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(148,163,184,.18);
  background: rgba(15,23,42,.65);
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow: 0 10px 25px rgba(0,0,0,.25);
}

.logo-img{
  width: 46px;
  height: 26px;
  object-fit: contain;
  opacity: .95;
}

.logos-hint{
  font-size:.82rem;
  opacity:.65;
  margin:0;
}

/* Header */
.head h2{ font-size:1.35rem; margin:0 0 .25rem; }
.meta{ opacity:.85; font-size:.95rem; }
.error{ margin-top:.5rem; }

/* Toolbar */
.toolbar .content{
  display:flex;
  flex-direction:column;
  gap:.9rem;
}

.search-row{
  display:grid;
  grid-template-columns: 1fr auto;
  gap:.75rem;
  align-items:end;
}

.field{ display:flex; flex-direction:column; gap:.35rem; }
.label{ font-size:.85rem; opacity:.85; }

.input, .select{
  background: rgba(15,23,42,.85);
  border: 1px solid rgba(148,163,184,.35);
  border-radius: 14px;
  padding: .55rem .75rem;
  font-size: .95rem;
  color: #e5e7eb;
  outline:none;
}

.btn{
  border-radius: 14px;
  padding: .55rem 1rem;
  font-weight: 600;
  cursor:pointer;
  border: 1px solid rgba(249,115,22,.55);
  background: rgba(249,115,22,.12);
  color: #e5e7eb;
}
.btn:disabled{ opacity:.6; cursor:not-allowed; }

.btn.mini{
  padding: .35rem .7rem;
  font-size: .85rem;
  border-radius: 999px;
}

/* Chips de texto (filtro real) */
.platform-row{
  display:flex;
  flex-wrap:wrap;
  gap:.5rem;
}
.chip{
  display:inline-flex;
  align-items:center;
  gap:.4rem;
  padding:.35rem .7rem;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,.25);
  background: rgba(15,23,42,.6);
  color:#e5e7eb;
  opacity:.85;
  cursor:pointer;
}
.chip.active{
  border-color: rgba(249,115,22,.75);
  opacity:1;
}

/* Advanced */
.advanced{ opacity:.9; }
.advanced summary{ cursor:pointer; user-select:none; }
.advanced-grid{
  margin-top:.75rem;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:.75rem;
}
.hint{ font-size:.85rem; opacity:.75; margin:.35rem 0 0; }

/* Results */
.results-head{ margin-bottom:.5rem; }
.results{ display:flex; flex-direction:column; gap:.75rem; }

.result-card{
  display:flex;
  gap:.85rem;
  padding:.65rem;
  border-radius: 16px;
  border: 1px solid rgba(148,163,184,.15);
  background: rgba(15,23,42,.45);
}

.poster{
  width:72px; height:98px;
  border-radius: 12px;
  overflow:hidden;
  flex: 0 0 auto;
  border: 1px solid rgba(148,163,184,.18);
}
.poster img{ width:100%; height:100%; object-fit:cover; display:block; }
.poster-fallback{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; opacity:.7; }

.info{ flex:1; display:flex; flex-direction:column; gap:.5rem; }
.title-row{ display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.title{ font-size:1.02rem; }
.pill{ font-size:.75rem; padding:.15rem .55rem; border-radius:999px; background: rgba(31,41,55,.95); }
.year{ opacity:.75; font-size:.9rem; }

/* Providers clickeables */
.providers{
  display:flex;
  flex-wrap:wrap;
  gap:.4rem;
  align-items:center;
}

.provider{
  appearance: none;
  border:1px solid rgba(148,163,184,.18);
  background: rgba(15,23,42,.55);
  color: #e5e7eb;
  border-radius: 999px;
  padding:.22rem .55rem;
  display:inline-flex;
  align-items:center;
  gap:.35rem;
  opacity:.45;
}

.provider.on{
  opacity:1;
  border-color: rgba(34,197,94,.6);
  cursor:pointer;
}

.provider.on:hover{
  border-color: rgba(249,115,22,.7);
}

.provider:disabled{
  cursor: not-allowed;
}

.dot{
  width:.55rem;
  height:.55rem;
  border-radius:999px;
  border:1px solid rgba(156,163,175,.8);
  display:inline-block;
  background: transparent;
}
.dot.on{ background:#22c55e; border-color:#22c55e; }

.actions{
  margin-top: .35rem;
  display:flex;
  gap:.5rem;
  flex-wrap:wrap;
}

.tiny{ font-size:.85rem; opacity:.75; }
.empty{ margin-top:.75rem; }
.disclaimer{ margin-top:.25rem; font-size:.85rem; opacity:.75; }

@media (max-width: 780px){
  .search-row{ grid-template-columns: 1fr; }
  .advanced-grid{ grid-template-columns: 1fr; }
  .logos-label{ display:none; }
  .logo-tile{ width: 66px; height: 40px; }
  .logo-img{ width: 42px; height: 24px; }
}
</style>
