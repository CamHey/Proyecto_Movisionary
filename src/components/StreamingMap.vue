<template>
  <section class="streaming-map">
    <header class="map-header">
      <h2>¿Dónde puedo ver este contenido?</h2>
      <p class="meta">
        Mapa conceptual de disponibilidad: para cada película/serie se muestran las
        plataformas de streaming donde está (datos simulados para la demo).
      </p>
    </header>

    <!-- Filtros -->
    <div class="filters card">
      <div class="content filters-content">
        <div class="filter-group">
          <label for="platform">Filtrar por plataforma</label>
          <select
            id="platform"
            v-model="selectedPlatform"
            aria-label="Filtrar por plataforma de streaming"
          >
            <option value="">Todas</option>
            <option v-for="p in platforms" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="type">Tipo</label>
          <select
            id="type"
            v-model="selectedType"
            aria-label="Filtrar por tipo de contenido"
          >
            <option value="">Todo</option>
            <option value="movie">Películas</option>
            <option value="tv">Series</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Mapa conceptual (tabla / grid de contenido x plataformas) -->
    <div class="card">
      <div class="content">
        <div class="map-legend">
          <span class="dot available"></span> Disponible
          <span class="dot not-available"></span> No disponible
        </div>

        <div class="table-wrapper" role="table" aria-label="Mapa de contenido y plataformas">
          <div class="table-header" role="rowgroup">
            <div class="table-row table-row--head" role="row">
              <div class="cell cell--title" role="columnheader">Título</div>
              <div class="cell" role="columnheader">Tipo</div>
              <div class="cell" role="columnheader">Año</div>
              <div
                class="cell cell--platforms"
                role="columnheader"
                aria-label="Plataformas de streaming"
              >
                Plataformas
              </div>
            </div>
          </div>

          <div class="table-body" role="rowgroup">
            <div
              v-for="item in filteredCatalog"
              :key="item.id"
              class="table-row"
              role="row"
            >
              <div class="cell cell--title" role="cell">
                <strong>{{ item.title }}</strong>
                <span class="badge" v-if="item.highlight">
                  {{ item.highlight }}
                </span>
              </div>
              <div class="cell" role="cell">
                <span class="pill pill--type">
                  {{ item.type === 'movie' ? 'Película' : 'Serie' }}
                </span>
              </div>
              <div class="cell" role="cell">
                {{ item.year }}
              </div>
              <div class="cell cell--platforms" role="cell">
                <span
                  v-for="platform in platforms"
                  :key="platform"
                  class="platform-pill"
                  :class="{
                    'platform-pill--on': item.platforms.includes(platform)
                  }"
                >
                  <span class="dot" :class="{ on: item.platforms.includes(platform) }"></span>
                  {{ platform }}
                </span>
              </div>
            </div>

            <p v-if="!filteredCatalog.length" class="meta no-results">
              No hay contenido que coincida con los filtros seleccionados.
            </p>
          </div>
        </div>
      </div>
    </div>

    <p class="disclaimer">
      * Datos ficticios usados solo con fines de demo para el proyecto Movisionary.
      En una integración real, estas plataformas y disponibilidades vendrían de una API.
    </p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

// Catálogo de ejemplo (mock)
const catalog = [
  {
    id: 'dune',
    title: 'Dune: Parte Uno',
    type: 'movie',
    year: 2021,
    platforms: ['HBO Max', 'Prime Video'],
    highlight: 'Sci-Fi'
  },
  {
    id: 'insideout',
    title: 'Intensamente 2',
    type: 'movie',
    year: 2024,
    platforms: ['Disney+', 'Prime Video'],
    highlight: 'Familiar'
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    type: 'movie',
    year: 2023,
    platforms: ['Prime Video'],
    highlight: 'Drama'
  },
  {
    id: 'strangerthings',
    title: 'Stranger Things',
    type: 'tv',
    year: 2016,
    platforms: ['Netflix'],
    highlight: 'Serie original'
  },
  {
    id: 'theoffice',
    title: 'The Office (US)',
    type: 'tv',
    year: 2005,
    platforms: ['Netflix', 'Prime Video'],
    highlight: 'Comedia'
  },
  {
    id: 'lokiseries',
    title: 'Loki',
    type: 'tv',
    year: 2021,
    platforms: ['Disney+'],
    highlight: 'Marvel'
  }
]

// Lista global de plataformas (columnas)
const platforms = ['Netflix', 'Disney+', 'Prime Video', 'HBO Max']

const selectedPlatform = ref('')
const selectedType = ref('')

// Catálogo filtrado según selects
const filteredCatalog = computed(() => {
  return catalog.filter((item) => {
    const matchesType = selectedType.value
      ? item.type === selectedType.value
      : true

    const matchesPlatform = selectedPlatform.value
      ? item.platforms.includes(selectedPlatform.value)
      : true

    return matchesType && matchesPlatform
  })
})
</script>

<style scoped>
.streaming-map {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.map-header h2 {
  font-size: 1.3rem;
  margin-bottom: 0.3rem;
}

.filters-content {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 180px;
}

.filter-group label {
  font-size: 0.85rem;
  opacity: 0.85;
}

.filter-group select {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.7);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.9rem;
  color: #e5e7eb;
}

.table-wrapper {
  overflow-x: auto;
  font-size: 0.9rem;
}

.table-row {
  display: grid;
  grid-template-columns: minmax(160px, 2.5fr) minmax(70px, 1fr) minmax(60px, 0.7fr) minmax(
      200px,
      3fr
    );
  gap: 0.75rem;
  padding: 0.5rem 0;
  align-items: center;
  border-bottom: 1px solid rgba(31, 41, 55, 0.8);
}

.table-row--head {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  border-bottom: 1px solid rgba(55, 65, 81, 0.9);
}

.cell--title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.cell--platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.platform-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(75, 85, 99, 0.9);
  background: rgba(15, 23, 42, 0.8);
  opacity: 0.45;
}

.platform-pill--on {
  opacity: 1;
  border-color: #f97316;
}

.badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.5);
}

.pill {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(31, 41, 55, 0.95);
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.dot {
  display: inline-block;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  border: 1px solid rgba(156, 163, 175, 0.9);
  background: transparent;
}

.dot.on,
.dot.available {
  background: #22c55e;
  border-color: #22c55e;
}

.dot.not-available {
  background: transparent;
  border-style: dashed;
}

.no-results {
  margin-top: 0.5rem;
}

.disclaimer {
  margin-top: 0.25rem;
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 700px) {
  .table-row {
    grid-template-columns: 1.6fr 1fr;
    grid-template-rows: auto auto;
  }

  .cell:nth-child(3) {
    /* Año debajo de tipo en pantallas pequeñas */
    order: 3;
  }

  .cell--platforms {
    grid-column: 1 / -1;
  }
}
</style>
