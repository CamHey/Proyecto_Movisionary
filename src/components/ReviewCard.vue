<template>
  <article class="review-card" :class="{ 'is-favorite': !!review.favorite }">
    <!-- !empleo de la prop -->
    <img
      v-if="review.cover"
      :src="review.cover"
      :alt="`Portada de ${review.title}`"
      loading="lazy"
    />
    <div class="review-content">
      <header class="review-card__header">
        <h2 class="review-card__title">{{ review.title }}</h2>

        <p class="review-card__meta">
          <span v-if="review.by">Por {{ review.by }}</span>
          <span v-if="review.by && review.cat"> • </span>
          <span v-if="review.cat">{{ labelCat(review.cat) }}</span>
          <span v-if="(review.by || review.cat) && hasTmdb"> • </span>
          <span v-if="hasTmdb">Comunidad</span>
        </p>
      </header>

      <p class="review-card__text">
        {{ review.text }}
      </p>

      <footer class="review-footer">
        <span class="rating">{{ formatScore(review.score) }}</span>

        <div class="actions">
          <!-- ✅ NUEVO: Ir a Comunidad -->
          <RouterLink
            v-if="hasTmdb"
            class="btn btn-sm"
            :to="{ name: 'movie-detail', params: { id: String(review.tmdbId) }, hash: '#community' }"
            title="Abrir el detalle y bajar a Comunidad"
          >
            Ir a Comunidad
          </RouterLink>

          <button class="btn btn-sm" type="button" @click="$emit('toggle-favorite', review.id)">
            {{ review.favorite ? "★ Favorito" : "☆ Favorito" }}
          </button>
        </div>
      </footer>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

 //!Recibe la prop-review del padre
const props = defineProps({
  review: { type: Object, required: true }
});

defineEmits(["toggle-favorite"]);

const hasTmdb = computed(() => {
  const v = props.review?.tmdbId;
  return v !== undefined && v !== null && String(v).trim() !== "";
});

function labelCat(cat) {
  switch (cat) {
    case "drama":
      return "Drama";
    case "scifi":
      return "Sci-Fi";
    case "animation":
      return "Animación";
    case "thriller":
      return "Thriller";
    default:
      return cat || "";
  }
}

function formatScore(s) {
  const n = Number(s);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(1)} / 5`;
}
</script>

<style scoped>
/* Reusa tu estilo global .review-card/.review-footer/.rating etc.
   Solo ajusto acciones para que entren bonito */
.actions{
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.btn.btn-sm{
  padding:6px 12px;
  font-size:0.85rem;
  min-height:32px;
  border-radius:999px;
}
</style>
