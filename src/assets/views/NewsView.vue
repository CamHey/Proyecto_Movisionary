<script setup>
import { useNews } from '../composables/useNews'
import { useTimeAgo } from '../composables/useTimeAgo'

const { list, order, filter } = useNews()
const timeAgo = useTimeAgo()
</script>

<template>
  <section class="hero hero-news container">
    <p class="eyebrow">Cine & Series · Actualidad</p>
    <h1 class="gradient-title">Noticias y tendencias</h1>
    <p class="sub">Cobertura diaria de estrenos, festivales, premios e industria.</p>
    <div class="hero-actions">
      <a href="#ultimas" class="btn btn-primary">Ver últimas</a>
      <a href="#categorias" class="btn btn-ghost">Filtrar por categoría</a>
    </div>
  </section>

  <section id="categorias" class="filters container">
    <button class="chip" :class="{ 'is-active': filter==='all' }" @click="filter='all'">Todas</button>
    <button class="chip" :class="{ 'is-active': filter==='estrenos' }" @click="filter='estrenos'">Estrenos</button>
    <button class="chip" :class="{ 'is-active': filter==='premios' }" @click="filter='premios'">Premios</button>
    <button class="chip" :class="{ 'is-active': filter==='festivales' }" @click="filter='festivales'">Festivales</button>
    <button class="chip" :class="{ 'is-active': filter==='industria' }" @click="filter='industria'">Industria</button>
  </section>

  <section class="news-meta container">
    <p>🗓️ Última actualización de esta sección: <time :dateTime="new Date().toISOString()">{{ new Date().toLocaleString('es-BO',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}) }}</time></p>
    <label for="news-sort">Ordenar por:</label>
    <select id="news-sort" v-model="order">
      <option value="desc">Más recientes</option>
      <option value="asc">Más antiguas</option>
    </select>
  </section>

  <main id="ultimas" class="container">
    <section class="news-grid">
      <article v-for="n in list" :key="n.id" class="news-card">
        <a class="cover" href="#"><img :src="n.cover" :alt="n.title" loading="lazy" /></a>
        <div class="content">
          <a class="tag" :class="n.cat" href="#">{{ n.cat[0].toUpperCase()+n.cat.slice(1) }}</a>
          <h2><a href="#">{{ n.title }}</a></h2>
          <div class="meta">
            <time :dateTime="n.published">{{ new Date(n.published).toLocaleString('es-BO',{weekday:'long',day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}) }}</time>
            <span>{{ timeAgo(n.published) }}</span> · <span class="news-read">{{ n.readMins }} min</span>
          </div>
        </div>
      </article>
    </section>
  </main>
</template>