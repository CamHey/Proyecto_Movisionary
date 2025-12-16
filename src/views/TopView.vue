<template>
  <section class="page-top">
    <!-- HERO -->
    <section class="hero container">
      <p class="eyebrow">Películas &amp; Series · Ranking</p>
      <h1 class="gradient-title">Top del mes</h1>
      <p class="sub">Puestos calculados según reseñas y popularidad global (TMDb).</p>
    </section>

    <main class="container">
      <!-- TOOLBAR -->
      <section class="toolbar" style="margin-top:8px;">
        <p class="muted">
          Ranking actualizado desde TMDb
        </p>

        <!-- ✅ sin error: disabled es boolean -->
        <button class="btn" type="button" @click="loadMore()" :disabled="btnDisabled">
          {{ btnText }}
        </button>
      </section>

      <!-- LISTA TOP 10 -->
      <section id="top-list" class="list ranked">
        <article v-for="(item, idx) in topSlice" :key="item.id" class="item">
          <div class="item-main">
            <span class="rank-num">#{{ idx + 1 }}</span>

            <img
              v-if="item.img"
              :src="item.img"
              alt=""
              class="mini-thumb"
              loading="lazy"
            />

            <span class="title">{{ item.title }}</span>
          </div>

          <em class="score">{{ item.score }}</em>
        </article>
      </section>

      <p v-if="loading" class="meta">Cargando top...</p>
      <p v-if="error" class="meta error">⚠ {{ error }}</p>

      <!-- TOP SORPRESA -->
      <section style="margin-top:32px;">
        <h2>Top sorpresa</h2>
        <p class="muted">Selección aleatoria sin repetición (DO…WHILE) desde el Top real.</p>
        <div class="grid-mini">
          <article v-for="s in surprise" :key="s.id" class="mini">
            <strong>{{ s.title }}</strong>
            <p class="meta">Puntaje: {{ s.score }}</p>
          </article>
        </div>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTop } from '../composables/useTop'

// usamos el hook que ahora llama a TMDb
//----------------------------------------------------
//Prop
const { top, visible, loading, error, loadMore, randomPick } = useTop()

const topSlice = computed(() => top.value.slice(0, visible.value))
const surprise = computed(() => randomPick(4))

const btnDisabled = computed(() => loading.value || visible.value >= top.value.length)
const btnText = computed(() => {
  if (loading.value) return 'Cargando...'
  if (visible.value >= top.value.length) return 'No hay más'
  return 'Cargar más'
})
</script>

<style scoped>
.page-top {
  padding-bottom: 2rem;
}

.list.ranked .item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.item-main {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.rank-num {
  font-weight: 700;
  min-width: 2.2rem;
}

.mini-thumb {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.title {
  font-size: 0.95rem;
}

.score {
  font-style: normal;
  font-weight: 600;
}

.error {
  color: #ff6b6b;
}

/* Por si no tienes este estilo aún en global */
.grid-mini {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.mini {
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid #ffffff22;
  background: #111;
}
</style>
