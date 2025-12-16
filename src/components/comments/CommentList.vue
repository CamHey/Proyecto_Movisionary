<template>
  <section aria-label="Lista de comentarios">
    <p v-if="loading" class="meta">Cargando comentarios…</p>
    <p v-else-if="error" class="meta error">{{ error }}</p>

    <div v-else-if="comments.length === 0" class="empty">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path
            d="M7.5 19.5c-1.657 0-3-1.343-3-3V7.5c0-1.657 1.343-3 3-3h9c1.657 0 3 1.343 3 3v6.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <path
            d="M8 9.2h8M8 12h6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <path
            d="M14.5 19.5l2-2 2 2 2-2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h4 class="empty-title">Todavía no hay comentarios</h4>
      <p class="empty-text">Sé el primero en dejar tu opinión 👀</p>
    </div>

    <TransitionGroup v-else name="c-list" tag="div" class="list">
      <article v-for="c in comments" :key="c.id" class="item">
        <div class="top">
          <div class="who">
            <strong class="author">{{ c.author }}</strong>
            <span class="time">{{ formatDate(c.createdAt) }}</span>
          </div>

          <button class="btn btn-ghost btn-sm" type="button" @click="$emit('delete-comment', c.id)">
            Eliminar
          </button>
        </div>

        <p class="text">{{ c.text }}</p>
      </article>
    </TransitionGroup>
  </section>
</template>

<script setup>
const props = defineProps({
  comments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});
defineEmits(["delete-comment"]);

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleString();
  } catch {
    return "";
  }
}
</script>

<style scoped>
.meta{
  opacity: 0.8;
  margin: 0;
  color: var(--muted);
}
.meta.error{
  color: #ff879b;
  opacity: 1;
}

/* empty state premium */
.empty{
  display: grid;
  place-items: center;
  text-align: center;
  padding: 18px;
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,.14);
  background: rgba(15,23,42,0.18);
}
.empty-icon{
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: rgba(255,255,255,.75);
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.10);
  margin-bottom: 8px;
}
.empty-title{
  margin: 6px 0 2px;
  font-size: 1rem;
}
.empty-text{
  margin: 0;
  color: var(--muted);
  font-size: .95rem;
}

/* list */
.list{
  display: grid;
  gap: 12px;
}

.item{
  padding: 12px 12px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(15,23,42,0.30);
  transition: transform .15s ease, border-color .2s ease, background .2s ease;
}
.item:hover{
  transform: translateY(-1px);
  border-color: rgba(122,167,255,.22);
  background: rgba(15,23,42,0.36);
}

.top{
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.who{
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.author{
  line-height: 1.1;
}
.time{
  font-size: 0.85rem;
  color: var(--muted);
  opacity: .9;
}

.text{
  margin: 8px 0 0;
  opacity: 0.98;
  white-space: pre-wrap;
}

/* TransitionGroup: acomodado bonito */
.c-list-enter-active,
.c-list-leave-active{
  transition: opacity .18s ease, transform .18s ease;
}
.c-list-enter-from,
.c-list-leave-to{
  opacity: 0;
  transform: translateY(8px);
}
</style>
