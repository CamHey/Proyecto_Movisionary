<script setup>
import { useReviews } from '../composables/useReviews'
const { list, filter } = useReviews()
</script>

<template>
  <section class="hero hero-reviews container">
    <p class="eyebrow">Cine & Series · Opinión</p>
    <h1 class="gradient-title">Reseñas de la comunidad</h1>
    <p class="sub">Comparte tu opinión y descubre qué dice la comunidad.</p>
  </section>

  <section class="filters container">
    <button class="chip" :class="{ 'is-active': filter==='all' }" @click="filter='all'">Todas</button>
    <button class="chip" :class="{ 'is-active': filter==='drama' }" @click="filter='drama'">Drama</button>
    <button class="chip" :class="{ 'is-active': filter==='scifi' }" @click="filter='scifi'">Sci-Fi</button>
    <button class="chip" :class="{ 'is-active': filter==='animacion' }" @click="filter='animacion'">Animación</button>
    <button class="chip" :class="{ 'is-active': filter==='thriller' }" @click="filter='thriller'">Thriller</button>
  </section>

  <main class="container">
    <section class="review-grid">
      <article v-for="r in list" :key="r.id" class="review-card">
        <img :src="r.cover" :alt="r.title" />
        <div class="review-content">
          <h2>{{ r.title }}</h2>
          <p>{{ r.text }}</p>
          <div class="review-footer">
            <span class="rating">★ {{ r.score.toFixed(1) }}</span>
            <span class="author">por {{ r.by }}</span>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>
