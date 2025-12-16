<template>
  <Transition name="c-fade-slide" appear>
    <section class="panel cwrap" aria-label="Sección de comunidad">
      <header class="c-head">
        <div class="c-head-left">
          <div class="c-title">
            <span class="c-icon" aria-hidden="true">💬</span>
            <h3 class="ctitle">Comunidad</h3>

            <span class="c-badge" :title="`${count} comentarios`">
              {{ count }}
            </span>
          </div>

          <p class="cmeta">
            Comentarios locales · tmdbId:
            <span class="c-id">{{ tmdbId }}</span>
          </p>
        </div>

        <div class="c-head-right">
          <div class="c-chips" role="tablist" aria-label="Orden de comentarios">
            <button
              class="c-chip"
              :class="{ 'is-active': sort === 'newest' }"
              type="button"
              @click="setSort('newest')"
            >
              Más nuevos
            </button>

            <button
              class="c-chip"
              :class="{ 'is-active': sort === 'oldest' }"
              type="button"
              @click="setSort('oldest')"
            >
              Más antiguos
            </button>
          </div>

          <button class="btn btn-ghost btn-sm" type="button" @click="toggleExpanded">
            {{ expanded ? "Ocultar" : "Mostrar" }}
          </button>
        </div>
      </header>

      <Transition name="c-accordion">
        <div v-show="expanded" class="c-body">
          <CommentForm :tmdbId="tmdbId" @add-comment="onAdd" />

          <div class="spacer" />

          <CommentList
            :comments="sortedComments"
            :loading="loading"
            :error="error"
            @delete-comment="onDelete"
          />
        </div>
      </Transition>
    </section>
  </Transition>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useComments } from "../../composables/useComments.js";

import CommentForm from "./CommentForm.vue";
import CommentList from "./CommentList.vue";

const props = defineProps({
  tmdbId: { type: [String, Number], required: true },
});

const tmdbId = computed(() => props.tmdbId);

const { comments, loading, error, load, add, remove } = useComments(props.tmdbId);

// --- UI state (persistente) ---
const sortKey = computed(() => `mv_comments_sort`);
const expandedKey = computed(() => `mv_comments_expanded_${tmdbId.value}`);

const sort = ref("newest"); // newest | oldest
const expanded = ref(true);

onMounted(() => {
  // cargar UI prefs
  sort.value = localStorage.getItem(sortKey.value) || "newest";
  expanded.value = localStorage.getItem(expandedKey.value) !== "0";

  load();
});

// si cambias de peli, recarga (y restaura expanded)
watch(
  () => tmdbId.value,
  () => {
    expanded.value = localStorage.getItem(expandedKey.value) !== "0";
    load();
  }
);

function setSort(v) {
  sort.value = v;
  localStorage.setItem(sortKey.value, v);
}

function toggleExpanded() {
  expanded.value = !expanded.value;
  localStorage.setItem(expandedKey.value, expanded.value ? "1" : "0");
}

// --- derived list (orden pro) ---
const count = computed(() => (comments.value?.length ? comments.value.length : 0));

const sortedComments = computed(() => {
  const arr = Array.isArray(comments.value) ? comments.value.slice() : [];
  arr.sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return sort.value === "newest" ? tb - ta : ta - tb;
  });
  return arr;
});

// --- actions ---
function onAdd(payload) {
  add(payload);
}

function onDelete(id) {
  const ok = window.confirm("¿Eliminar este comentario? Esta acción no se puede deshacer.");
  if (!ok) return;
  remove(id);
}
</script>

<style scoped>
/* wrapper premium: blur + borde suave (sin romper tu theme) */
.cwrap {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 18px 50px rgba(0,0,0,.28);
  backdrop-filter: blur(10px);
}

/* header */
.c-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(15, 23, 42, 0.25);
}

.c-head-left {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.c-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.c-icon {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.10);
  box-shadow: 0 10px 24px rgba(0,0,0,.18);
}

.ctitle {
  margin: 0;
  font-size: 1rem;
  letter-spacing: .2px;
  white-space: nowrap;
}

.c-badge {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0b0f17;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  box-shadow: 0 10px 22px rgba(0,0,0,.22);
}

.cmeta {
  margin: 0;
  opacity: 0.75;
  font-size: 0.85rem;
  color: var(--muted);
}
.c-id {
  font-weight: 700;
  opacity: 0.95;
}

/* right side */
.c-head-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.c-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.c-chip {
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  color: var(--text);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  transition: transform .15s ease, background .2s ease, border-color .2s ease, opacity .2s ease;
}
.c-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(122,167,255,.35);
}
.c-chip.is-active {
  background: linear-gradient(90deg, var(--brand1), var(--brand2));
  color: #0b0f17;
  border-color: transparent;
}

/* body spacing */
.c-body {
  margin-top: 12px;
}
.spacer {
  height: 10px;
}

/* ===== Transitions ===== */
.c-fade-slide-enter-active,
.c-fade-slide-leave-active {
  transition: opacity .22s ease, transform .22s ease;
}
.c-fade-slide-enter-from,
.c-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* acordeón simple */
.c-accordion-enter-active,
.c-accordion-leave-active {
  transition: opacity .18s ease, transform .18s ease, max-height .22s ease;
  overflow: hidden;
}
.c-accordion-enter-from,
.c-accordion-leave-to {
  opacity: 0;
  transform: translateY(6px);
  max-height: 0;
}
.c-accordion-enter-to,
.c-accordion-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1200px;
}
</style>
