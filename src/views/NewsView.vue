<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getGuardianNewsFeed } from "/src/services/guardians";

const loading = ref(true);
const error = ref("");
const items = ref([]);
const lastUpdated = ref(null);

// UI
const sortBy = ref("newest"); // newest | oldest
const category = ref("all");  // all | Estrenos | Premios | Festivales
const range = ref("30d");     // 7d | 30d | 1y | 10y

// Cache simple (para no spammear la API)
const CACHE_KEY = "movisionary_guardian_news_v2";
const TTL = 1000 * 60 * 5; // ✅ 5 min (antes 20) para que "se note" que actualiza

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.data) return null;
    if (Date.now() - parsed.ts > TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat("es-BO", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function rangeConfig(r) {
  // ✅ Ajusta qué tan “antiguo” y cuántas páginas trae
  if (r === "7d")  return { daysBack: 7,    pagesPerCategory: 1, label: "Últimos 7 días" };
  if (r === "30d") return { daysBack: 30,   pagesPerCategory: 2, label: "Últimos 30 días" };
  if (r === "1y")  return { daysBack: 365,  pagesPerCategory: 2, label: "Último año" };
  if (r === "10y") return { daysBack: 3650, pagesPerCategory: 3, label: "Últimos 10 años" };
  return { daysBack: 30, pagesPerCategory: 2, label: "Últimos 30 días" };
}

const rangeLabel = computed(() => rangeConfig(range.value).label);

async function loadNews(force = false) {
  loading.value = true;
  error.value = "";

  try {
    if (!force) {
      const cached = loadCache();
      if (cached) {
        items.value = cached.data;
        lastUpdated.value = new Date(cached.ts);
        loading.value = false;
        return;
      }
    }

    const cfg = rangeConfig(range.value);

    // ✅ Aquí pasan los parámetros para “más antiguas + más páginas”
    const data = await getGuardianNewsFeed({
      daysBack: cfg.daysBack,
      pagesPerCategory: cfg.pagesPerCategory,
    });

    items.value = data;
    lastUpdated.value = new Date();
    saveCache(data);
  } catch (e) {
    error.value = e?.message || "Error cargando noticias";
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  let list = items.value || [];

  if (category.value !== "all") {
    list = list.filter((x) => x.category === category.value);
  }

  list = [...list].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return sortBy.value === "newest" ? db - da : da - db;
  });

  return list;
});

// ✅ Si cambias el rango (7d/30d/1y/10y) recarga
watch(range, () => loadNews(true));

// ✅ Auto-refresh cada 5 min (y también carga al inicio)
onMounted(() => {
  loadNews(false);
  setInterval(() => loadNews(true), 5 * 60 * 1000);
});
</script>

<template>
  <section class="hero">
    <div class="container">
      <p class="eyebrow">Actualidad</p>
      <h1 class="gradient-title">Noticias</h1>
      <p class="sub">
        Solo cine (estrenos, premios, festivales) · Fuente: The Guardian · {{ rangeLabel }}
      </p>

      <p class="meta" v-if="lastUpdated">
        Última actualización: {{ formatDate(lastUpdated.toISOString()) }}
      </p>

      <div class="controls">
        <select v-model="category" class="select">
          <option value="all">Todas</option>
          <option value="Estrenos">Estrenos</option>
          <option value="Premios">Premios</option>
          <option value="Festivales">Festivales</option>
        </select>

        <select v-model="sortBy" class="select">
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
        </select>

        <select v-model="range" class="select">
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="1y">Último año</option>
          <option value="10y">Últimos 10 años</option>
        </select>

        <button class="btn btn-ghost" :disabled="loading" @click="loadNews(true)">
          {{ loading ? "Actualizando…" : "Actualizar" }}
        </button>
      </div>

      <p v-if="error" class="meta" style="margin-top:10px;">❌ {{ error }}</p>
    </div>
    <div class="hero-gradient"></div>
  </section>

  <main class="container">
    <p v-if="loading" class="meta">Cargando noticias…</p>

    <!-- ✅ SOLO CAMBIÓ ESTA SECCIÓN DE CARDS -->
    <div v-else class="news-grid">
      <a
        v-for="n in filtered"
        :key="n.id"
        class="news-card"
        :href="n.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="cover">
          <img v-if="n.image" :src="n.image" alt="" loading="lazy" />
          <span v-else class="noimg">Sin imagen</span>
        </span>

        <div class="content">
          <span class="tag" :class="String(n.category || '').toLowerCase()">
            {{ n.category }}
          </span>

          <h3>{{ n.title }}</h3>

          <p class="meta">
            <span>{{ formatDate(n.date) }}</span>
            <span class="dot">·</span>
            <span>{{ n.source }}</span>
          </p>

          <p class="excerpt" v-html="n.excerpt"></p>
        </div>
      </a>
    </div>
    <!-- ✅ FIN CAMBIO -->

    <div v-if="!loading && !filtered.length" class="panel empty-state">
      <p class="meta">No hay resultados. Prueba “Actualizar” o cambia el rango.</p>
    </div>
  </main>
</template>


<style scoped>
.controls { display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
.select { padding:10px 12px; border-radius:12px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.10); color:inherit; }

.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:14px; margin-top:14px; }

.card { display:block; border-radius:18px; overflow:hidden; border:1px solid rgba(255,255,255,.08); text-decoration:none; background:rgba(0,0,0,.15); }
.thumb img { width:100%; height:160px; object-fit:cover; display:block; }
.noimg { height:160px; display:flex; align-items:center; justify-content:center; opacity:.7; }

.content { padding:12px; }
.tag { display:inline-block; padding:4px 10px; border-radius:999px; background:rgba(255,255,255,.10); font-size:.9rem; }
.excerpt { opacity:.9; margin-top:8px; font-size:.95rem; }
</style>
