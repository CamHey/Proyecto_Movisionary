<script setup>
import { computed } from 'vue'
import { useTop } from '../composables/useTop'
const { top, visible, loadMore, randomPick } = useTop()
const topSlice = computed(() => top.value.slice(0, visible.value))
const surprise = computed(() => randomPick(4))
</script>

<template>
  <section class="hero container">
    <p class="eyebrow">Películas & Series · Ranking</p>
    <h1 class="gradient-title">Top del mes</h1>
    <p class="sub">Puestos calculados según reseñas y popularidad.</p>
  </section>

  <main class="container">
    <section class="toolbar" style="margin-top:8px;">
      <p class="muted">Ranking actualizado</p>
      <button class="btn" type="button" @click="loadMore()">Cargar más</button>
    </section>

    <section id="top-list" class="list ranked">
      <article v-for="(item, idx) in topSlice" :key="item.id" class="item">
        <span><strong>#{{ idx+1 }}</strong> — {{ item.title }}</span>
        <em>{{ item.score }}</em>
      </article>
    </section>

    <section style="margin-top:32px;">
      <h2>Top sorpresa</h2>
      <p class="muted">Selección aleatoria sin repetición (DO…WHILE)</p>
      <div class="grid-mini">
        <article v-for="s in surprise" :key="s.id" class="mini">
          <strong>{{ s.title }}</strong>
          <p class="meta">Puntaje: {{ s.score }}</p>
        </article>
      </div>
    </section>
  </main>
</template>