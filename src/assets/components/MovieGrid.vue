<template>
  <section id="cartelera" class="grid-movies container">
    <h2 class="section-title">{{ title }}</h2>

    <!-- Si no hay items todavía, mostramos estado vacío lindo -->
    <div v-if="visibleItems.length === 0" class="empty-state">
      <p class="muted">{{ emptyText }}</p>
    </div>

    <!-- Grid de tarjetas -->
    <div v-else class="grid">
      <article
        v-for="movie in visibleItems"
        :key="movie.id ?? movie.title"
        class="card"
      >
        <div class="thumb">
          <img
            :src="movie.cover || movie.poster || movie.img"
            :alt="movie.title"
          />
        </div>

        <div class="content">
          <h3>{{ movie.title }}</h3>

          <p class="meta">
            <span v-if="movie.year">{{ movie.year }}</span>
            <span v-if="movie.type">{{ movie.type }}</span>
            <span v-if="movie.tags && movie.tags.length">
              {{ movie.tags.join(' · ') }}
            </span>
          </p>

          <p v-if="movie.description" class="muted">
            {{ movie.description }}
          </p>

          <p v-if="movie.rating" class="rate">
            ★ {{ movie.rating }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Cartelera destacada'
  },
  emptyText: {
    type: String,
    default: 'La cartelera se cargará aquí…'
  },
  // Por si quieres limitar cuántas tarjetas mostrar
  limit: {
    type: Number,
    default: 0
  }
})

const visibleItems = computed(() => {
  if (!props.limit || props.limit <= 0) return props.items
  return props.items.slice(0, props.limit)
})
</script>
