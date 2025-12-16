<template>
  <main class="page">
    <section class="hero" style="padding: 2.2rem 0 1rem;">
      <div class="container">
        <p class="eyebrow">Mi lista</p>
        <h1 class="gradient-title">Watchlist</h1>
        <p class="sub">Marca lo que ya viste ✅ y mantén tus pendientes ordenados.</p>

        <div class="wl-toolbar">
          <div class="wl-filters">
            <button class="chip" :class="{ 'is-active': filter === 'all' }" @click="filter='all'">
              Todas ({{ movies.length }})
            </button>
            <button class="chip" :class="{ 'is-active': filter === 'pending' }" @click="filter='pending'">
              Pendientes ({{ pendingCount }})
            </button>
            <button class="chip" :class="{ 'is-active': filter === 'watched' }" @click="filter='watched'">
              Vistas ({{ watchedCount }})
            </button>
          </div>

          <div class="wl-actionsTop">
            <button class="btn ghost" @click="refresh">Actualizar</button>
            <button class="btn" @click="loadDetails" :disabled="detailsLoading || movies.length===0">
              {{ detailsLoading ? "Cargando..." : "Cargar detalles TMDb" }}
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="state error" style="margin:10px 0 0;">{{ errorMsg }}</p>
      </div>
    </section>

    <section class="container">
      <div v-if="filtered.length === 0" class="empty-state">
        <div>
          <h3 style="margin:0 0 6px;">Tu watchlist está vacía</h3>
          <p class="meta" style="margin:0;">Entra al detalle y presiona <strong>+ Watchlist</strong>.</p>
        </div>
      </div>

      <ul v-else class="wl-list">
        <li v-for="m in filtered" :key="m.id" class="wl-item">
          <label class="wl-check">
            <input type="checkbox" :checked="isWatched(m.id)" @change="toggleWatched(m.id)" />
            <span class="wl-box" aria-hidden="true"></span>
          </label>

          <div class="wl-card">
            <img
              class="wl-poster"
              :src="m.posterUrl || '/img/poster-fallback.png'"
              :alt="`Poster de ${m.title}`"
              loading="lazy"
              width="54"
              height="81"
              @error="onPosterError"
            />

            <div class="wl-info">
              <button class="wl-title" type="button" @click="goDetail(m.id)">
                {{ m.title }}
              </button>
              <div class="wl-meta">
                <span v-if="m.year">{{ m.year }}</span>
                <span v-if="m.rating"> • ⭐ {{ m.rating }}</span>
                <span v-if="m.isPlaceholder" style="opacity:.7;"> • (sin detalles)</span>
              </div>
            </div>

            <div class="wl-actions">
              <button class="btn ghost small" @click="removeFromWatchlist(m.id)">
                Quitar
              </button>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useLocalLists } from "../composables/useLocalLists.js";

const router = useRouter();
const lists = useLocalLists();

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const movies = ref([]);
const filter = ref("all");
const errorMsg = ref("");
const detailsLoading = ref(false);

// ✅ visto/no visto
const WATCHED_KEY = "movisionary:watchlist:watchedMap";
function safeParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }
const watchedMap = ref(safeParse(localStorage.getItem(WATCHED_KEY), {}));
const isWatched = (id) => !!watchedMap.value[String(id)];
const toggleWatched = (id) => {
  const k = String(id);
  watchedMap.value[k] = !watchedMap.value[k];
  localStorage.setItem(WATCHED_KEY, JSON.stringify(watchedMap.value));
};

// ✅ lee la KEY REAL
function readWatchIds() {
  const arr = safeParse(localStorage.getItem("movisionary_watchlist_v1") || "[]", []);
  return Array.isArray(arr) ? arr.map(String) : [];
}

// ✅ render instantáneo
function refresh() {
  errorMsg.value = "";
  const ids = readWatchIds();

  movies.value = ids.map((id) => ({
    id,
    title: `Título (${id})`,
    year: "",
    rating: "",
    posterUrl: "",
    isPlaceholder: true,
  }));
}

// ✅ detalles TMDb (no bloquea UI)
async function loadDetails() {
  if (!movies.value.length) return;

  if (!API_KEY) {
    errorMsg.value = "No se encontró VITE_TMDB_API_KEY (mostrando solo IDs).";
    return;
  }

  detailsLoading.value = true;
  errorMsg.value = "";

  try {
    const out = [];

    for (const m of movies.value) {
      const id = m.id;
      const url = new URL(`${BASE_URL}/movie/${id}`);
      url.searchParams.set("api_key", API_KEY);
      url.searchParams.set("language", "es-ES");

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        out.push({
          id: String(data.id),
          title: data.title || `Título (${id})`,
          year: data.release_date ? data.release_date.slice(0, 4) : "",
          rating: typeof data.vote_average === "number" ? data.vote_average.toFixed(1) : "",
          posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : "",
          isPlaceholder: false,
        });
      } catch {
        out.push(m);
      } finally {
        clearTimeout(t);
      }
    }

    movies.value = out;
  } catch (e) {
    errorMsg.value = e?.message || "No se pudieron cargar detalles TMDb.";
  } finally {
    detailsLoading.value = false;
  }
}

function goDetail(id) {
  router.push(`/movie/${id}`);
}

function removeFromWatchlist(id) {
  lists.toggleWatchlist(String(id));
  refresh();
}

function onPosterError(e) {
  e.target.src = "/img/poster-fallback.png";
}

// filtros
const filtered = computed(() => {
  if (filter.value === "pending") return movies.value.filter((m) => !isWatched(m.id));
  if (filter.value === "watched") return movies.value.filter((m) => isWatched(m.id));
  return movies.value;
});
const watchedCount = computed(() => movies.value.filter((m) => isWatched(m.id)).length);
const pendingCount = computed(() => movies.value.filter((m) => !isWatched(m.id)).length);

// ✅ sync tabs + al volver a la pestaña
const onLists = () => refresh();
const onStorage = (e) => {
  if (e.key === "movisionary_watchlist_v1" || e.key === "movisionary_lists_tick") refresh();
};
const onFocus = () => refresh();
const onVis = () => { if (!document.hidden) refresh(); };

onMounted(() => {
  window.addEventListener("mv:lists", onLists);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVis);

  refresh();
});

onBeforeUnmount(() => {
  window.removeEventListener("mv:lists", onLists);
  window.removeEventListener("storage", onStorage);
  window.removeEventListener("focus", onFocus);
  document.removeEventListener("visibilitychange", onVis);
});
</script>

<style scoped>
.page{ padding-bottom:48px; }
.wl-toolbar{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:14px; flex-wrap:wrap; }
.wl-filters{ display:flex; gap:10px; flex-wrap:wrap; }
.wl-actionsTop{ display:flex; gap:10px; flex-wrap:wrap; }

.chip{
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  color:var(--text);
  padding:.55rem .9rem;
  border-radius:999px;
  cursor:pointer;
  font-weight:700;
}
.chip.is-active{
  background:linear-gradient(90deg,var(--brand1),var(--brand2));
  color:#0b0f17;
  border-color:transparent;
}

.wl-list{ list-style:none; margin:18px 0 0; padding:0; display:grid; gap:12px; }
.wl-item{ display:flex; gap:10px; align-items:flex-start; }
.wl-check{ display:inline-flex; align-items:center; gap:10px; padding-top:10px; }
.wl-check input{ position:absolute; opacity:0; width:0; height:0; }
.wl-box{
  width:22px; height:22px; border-radius:8px;
  border:1px solid rgba(255,255,255,.20);
  background: rgba(255,255,255,.04);
  display:inline-block;
}
.wl-check input:checked + .wl-box{
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  border-color: transparent;
}

.wl-card{
  flex:1; display:flex; align-items:center; gap:12px; padding:12px;
  border-radius:18px; border:1px solid rgba(255,255,255,.10);
  background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
  box-shadow: 0 10px 30px rgba(0,0,0,.25);
}
.wl-poster{ width:54px; height:81px; border-radius:12px; object-fit:cover; background: rgba(255,255,255,.04); flex-shrink:0; }
.wl-info{ min-width:0; flex:1; display:flex; flex-direction:column; gap:4px; }
.wl-title{
  background:transparent; border:0; padding:0; margin:0;
  text-align:left; color:var(--text);
  font:inherit; font-weight:800; cursor:pointer;
}
.wl-title:hover{ text-decoration: underline; }
.wl-meta{ color: rgba(255,255,255,.70); font-size:.92rem; }
.wl-actions{ display:flex; align-items:center; gap:10px; }

.btn{
  font:inherit; padding:10px 12px; border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: inherit; cursor:pointer;
}
.btn:hover{ background: rgba(255,255,255,.10); }
.btn.ghost{ background:transparent; }
.btn.small{ padding:8px 10px; border-radius:12px; }

.state.error{ color:#ffb3b3; }
</style>
