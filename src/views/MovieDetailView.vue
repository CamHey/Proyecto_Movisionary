<template>
  <main class="page">
    <header class="detail-header">
      <button class="btn ghost" @click="$router.back()">← Volver</button>
      <div class="title-block">
        <h1 class="title">{{ title }}</h1>
        <p class="meta">
          <span v-if="year">{{ year }}</span>
          <span v-if="year && runtime"> • </span>
          <span v-if="runtime">{{ runtime }} min</span>
          <span v-if="rating"> • ⭐ {{ rating }}</span>
        </p>
      </div>
    </header>

    <section class="detail-grid" v-if="!loading && !errorMsg">
      <div class="poster-wrap">
        <img
          class="poster"
          :src="posterUrl"
          :alt="`Poster de ${title}`"
          loading="lazy"
          width="360"
          height="540"
          @error="onPosterError"
        />
      </div>

      <div class="content">
        <div class="actions">
          <button class="btn" @click="toggleFav">
            {{ isFav ? "★ En favoritos" : "☆ Agregar a favoritos" }}
          </button>
          <button class="btn" @click="toggleWatch">
            {{ isWatch ? "✓ En watchlist" : "+ Watchlist" }}
          </button>
        </div>

        <h2 class="section-title">Sinopsis</h2>
        <p class="overview">
          {{ overview || "Sinopsis no disponible." }}
        </p>

        <div v-if="genres?.length" class="chips">
          <span class="chip" v-for="g in genres" :key="g.id">{{ g.name }}</span>
        </div>

        <hr class="sep" />

        <!-- ✅ VibeAI -->
        <section class="vibe">
          <div class="vibe-head">
            <h2 class="section-title">VibeAI</h2>
            <p class="hint">Resumen sin spoilers + audio</p>
          </div>

          <div class="vibe-actions">
            <div class="select-wrap">
              <select class="select" v-model="tono" :disabled="aiLoading">
                <option value="relajado">Relajado</option>
                <option value="epico">Épico</option>
                <option value="dark">Dark</option>
                <option value="divertido">Divertido</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <button class="btn" :disabled="aiLoading" @click="generateVibe">
              {{ aiLoading ? "Generando..." : "Generar resumen + audio (30s)" }}
            </button>
          </div>

          <p v-if="aiError" class="warn" aria-live="polite">{{ aiError }}</p>

          <div class="ai-box" v-if="aiText">
            <p class="ai-text">{{ aiText }}</p>
            <button class="btn ghost small" @click="copyText">Copiar</button>
          </div>

          <div v-if="aiAudioUrl" class="audio">
            <audio controls :src="aiAudioUrl"></audio>
          </div>
        </section>

        <hr class="sep" />

        <!-- ✅ Comunidad (CHAT EN VIVO) -->
        <section class="community" id="community">
          <h2 class="section-title">Comunidad</h2>
          <p class="hint" style="margin: 0 0 10px;">
            Chat en vivo por película (canal por tmdbId).
          </p>

          <CommunityChat :tmdbId="id" :key="id" />
        </section>
      </div>
    </section>

    <section v-if="loading" class="state">Cargando detalle…</section>
    <section v-if="errorMsg" class="state error">{{ errorMsg }}</section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

import { useLocalLists } from "../composables/useLocalLists.js";
import { useVibeAI } from "../composables/useVibeAI.js";

// ✅ CHAT
import CommunityChat from "../components/CommunityChat.vue";

// ======================
// TMDb
// ======================
const route = useRoute();
const id = computed(() => route.params.id);

const loading = ref(true);
const errorMsg = ref("");

const movie = ref(null);
const posterUrl = ref("");
const posterBroken = ref(false);

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

function getPoster(posterPath) {
  if (!posterPath) return "/img/poster-fallback.png";
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function setSeo(data) {
  document.title = `Movisionary — ${data.title || "Detalle"}`;

  const desc =
    (data.overview || "").slice(0, 160) ||
    `Detalle de ${data.title || "película"} en Movisionary.`;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);

  const prev = document.getElementById("jsonld-movie");
  if (prev) prev.remove();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: data.title || "Movie",
    description: data.overview || "",
    datePublished: data.release_date || undefined,
    image: data.poster_path ? getPoster(data.poster_path) : undefined,
    aggregateRating: data.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: String(data.vote_average),
          bestRating: "10",
          ratingCount: String(data.vote_count || 0),
        }
      : undefined,
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "jsonld-movie";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

async function fetchMovie() {
  loading.value = true;
  errorMsg.value = "";

  try {
    if (!API_KEY) throw new Error("No se encontró VITE_TMDB_API_KEY en .env.local");

    const url = new URL(`${BASE_URL}/movie/${id.value}`);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("language", "es-ES");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDb error HTTP ${res.status}`);

    const data = await res.json();
    movie.value = data;
    setSeo(data);
    posterUrl.value = getPoster(data.poster_path);
  } catch (e) {
    errorMsg.value = e?.message || "No se pudo cargar el detalle.";
  } finally {
    loading.value = false;
  }
}

function onPosterError() {
  posterBroken.value = true;
  posterUrl.value = "/img/poster-fallback.png";
}

// ======================
// Computeds
// ======================
const title = computed(() => movie.value?.title || "Detalle");
const overview = computed(() => movie.value?.overview || "");
const year = computed(() =>
  movie.value?.release_date ? movie.value.release_date.slice(0, 4) : ""
);
const runtime = computed(() => movie.value?.runtime || "");
const rating = computed(() => {
  const v = movie.value?.vote_average;
  return typeof v === "number" ? v.toFixed(1) : "";
});
const genres = computed(() => movie.value?.genres || []);

// ======================
// Favoritos / Watchlist
// ======================
const { isFavorite, isWatchlist, toggleFavorite, toggleWatchlist } = useLocalLists();
const isFav = computed(() => isFavorite(id.value));
const isWatch = computed(() => isWatchlist(id.value));

function toggleFav() {
  toggleFavorite(id.value);
}
function toggleWatch() {
  toggleWatchlist(id.value);
}

// ======================
// VibeAI
// ======================
const tono = ref("relajado");
const {
  loading: aiLoading,
  error: aiError,
  text: aiText,
  audioUrl: aiAudioUrl,
  generate,
} = useVibeAI();

function buildTema() {
  const g = genres.value?.map((x) => x.name).slice(0, 4).join(", ");
  const y = year.value ? ` (${year.value})` : "";
  const extra = g ? ` — Géneros: ${g}.` : "";
  return `${title.value}${y}${extra}`;
}

async function generateVibe() {
  await generate({
    movieId: id.value,
    tema: buildTema(),
    duracion: 30,
    tono: tono.value,
    requireAudio: true,
  });
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(aiText.value || "");
  } catch {}
}

// ======================
// Lifecycle
// ======================
onMounted(fetchMovie);
watch(id, fetchMovie);
</script>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.title-block {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}

.meta {
  margin: 6px 0 0;
  opacity: 0.8;
}

.detail-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 18px;
}

.poster-wrap {
  position: sticky;
  top: 18px;
  align-self: start;
}

.poster {
  width: 100%;
  border-radius: 18px;
  display: block;
}

.content {
  min-width: 0;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.section-title {
  margin: 10px 0 6px;
  font-size: 16px;
}

.overview {
  margin: 0;
  opacity: 0.95;
}

.chips {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  opacity: 0.9;
}

.sep {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.10);
  margin: 16px 0;
}

.vibe-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hint {
  margin: 0;
  opacity: 0.75;
  font-size: 13px;
}

.vibe-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  align-items: center;
}

.select-wrap {
  position: relative;
  min-width: 180px;
}

.select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  font: inherit;
  padding: 10px 38px 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;

  outline: none;
  cursor: pointer;
}

.select:focus {
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.select-wrap::after {
  content: "▾";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
  pointer-events: none;
}

.select option {
  background: #0f1116;
  color: #fff;
}

.ai-box {
  margin-top: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.ai-text {
  margin: 0;
}

.audio {
  margin-top: 10px;
}

.state {
  padding: 18px;
  opacity: 0.9;
}

.state.error {
  color: #ffb3b3;
}

.warn {
  margin-top: 10px;
  color: #ffd5a8;
}

.btn {
  font: inherit;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: inherit;
  cursor: pointer;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.10);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.ghost {
  background: transparent;
}

.btn.small {
  padding: 8px 10px;
  border-radius: 12px;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .poster-wrap {
    position: relative;
    top: auto;
    max-width: 420px;
  }
}
</style>
