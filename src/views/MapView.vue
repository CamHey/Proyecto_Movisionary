<!-- src/views/MapView.vue -->
<template>
  <div class="page-map">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Integraciones</p>
        <h1 class="gradient-title">Mapa de Streaming</h1>
        <p class="sub">
          Responde a la pregunta: “¿Dónde puedo ver cada película o serie?”,
          mapeando el catálogo contra las plataformas de streaming (demo).
        </p>
      </div>
    </section>

    <!-- Contenido -->
    <main class="container">
      <!-- ✅ SOLO 1 columna, sin la tarjeta de descripción -->
      <section class="grid-auto">
        <article class="card">
          <StreamingMap
            :initialTitle="initialTitle"
            :initialPlatform="initialPlatform"
            :initialRegion="initialRegion"
          />
        </article>
      </section>
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>© 2025 Movisionary · Mapa de streaming (demo)</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StreamingMap from '../components/StreamingMap.vue'

const route = useRoute()

// ✅ helper: si query param viene como array, agarramos el primero
const toStr = (v, fallback = '') => (Array.isArray(v) ? (v[0] ?? fallback) : (v ?? fallback))

// ✅ props iniciales desde URL: /map?title=Dune&platform=Netflix&region=BO
const initialTitle = computed(() => toStr(route.query.title, ''))
const initialPlatform = computed(() => toStr(route.query.platform, 'Todas'))
const initialRegion = computed(() => toStr(route.query.region, 'BO'))
</script>

<style scoped>
/* ✅ 1 columna */
.grid-auto {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
</style>
