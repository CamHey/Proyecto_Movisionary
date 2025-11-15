<template>
  <section class="featured">
    <!-- LOADING -->
    <div v-if="loading" class="loading">
      <p>Cargando destacados…</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="error">
      <p>Error cargando datos.</p>
    </div>

    <!-- GRID -->
    <div v-else class="grid">
      <article
        v-for="item in items"
        :key="item.id"
        class="card"
      >
        <img
          :src="img(item.poster_path)"
          :alt="item.title || item.name"
          class="poster"
          loading="lazy"
        />

        <div class="info">
          <h3>{{ item.title || item.name }}</h3>
          <span class="rating">⭐ {{ item.vote_average.toFixed(1) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import useTmdb from '../composables/useTmdb'

// 👉 usamos el mismo composable de TMDb
const { items, loading, error, fetchTrending } = useTmdb()

// cargar trending al entrar
onMounted(() => {
  fetchTrending()
})

// helper para posters
const img = (path) =>
  path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : 'https://via.placeholder.com/400x600?text=Sin+imagen'
</script>

<style scoped>
.featured {
  margin-top: 1rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  opacity: 0.7;
}

.grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--panel);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 0 1px #ffffff0a inset;
  transition: .2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px #0005;
}

.poster {
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.info {
  padding: .75rem;
}

h3 {
  font-size: .95rem;
  font-weight: 600;
  margin: 0 0 .5rem;
}

.rating {
  font-size: .85rem;
  opacity: .8;
}
</style>
