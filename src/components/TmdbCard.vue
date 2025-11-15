<!-- src/components/TmdbCard.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// Helpers derivados de la prop
const title = computed(() => props.item.title || props.item.name || 'Sin título')
const rating = computed(() =>
  props.item.vote_average ? props.item.vote_average.toFixed(2) : '—'
)
const year = computed(() => {
  const date = props.item.release_date || props.item.first_air_date
  return date ? date.slice(0, 4) : ''
})

const imgUrl = (path) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : ''
</script>

<template>
  <article class="card tmdb-card">
    <!-- Póster -->
      <!-- TODO: Directivas-->
    <div class="thumb" v-if="item.poster_path">
      <img v-bind:src="imgUrl(item.poster_path)" :alt="title" />
    </div>

    <!-- Contenido -->
    <div class="content">
      <h3>{{ title }}</h3>
      <p class="meta">
        <span v-if="year">{{ year }} · </span>
        ⭐ {{ rating }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.tmdb-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Asegura que la imagen ocupe bien la parte de arriba */
.tmdb-card .thumb img {
  width: 100%;
  display: block;
  border-radius: 10px 10px 0 0;
}
</style>
