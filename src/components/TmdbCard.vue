<!-- src/components/TmdbCard.vue -->
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

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

const imgUrl = (path) => (path ? `https://image.tmdb.org/t/p/w500${path}` : '')

// ✅ Link al detalle
const detailTo = computed(() => `/movie/${props.item.id}`)
</script>

<template>
  <RouterLink :to="detailTo" class="tmdb-link" aria-label="Ver detalle">
    <article class="card tmdb-card">
      <!-- Póster -->
      <div class="thumb" v-if="item.poster_path">
        <img
          :src="imgUrl(item.poster_path)"
          :alt="title"
          loading="lazy"
          width="300"
          height="450"
        />
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
  </RouterLink>
</template>

<style scoped>
.tmdb-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.tmdb-link:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.35);
  outline-offset: 6px;
  border-radius: 12px;
}

.tmdb-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
}

/* Asegura que la imagen ocupe bien la parte de arriba */
.tmdb-card .thumb img {
  width: 100%;
  display: block;
  border-radius: 10px 10px 0 0;
}
</style>
