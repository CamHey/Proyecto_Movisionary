<template>
  <section class="page-home">
    <!-- HERO -->
    <section class="hero hero-news">
      <div class="container">
        <div class="hero-copy">
          <span class="eyebrow">Cine &amp; Series</span>
          <h1 class="grad-title">Descubre nuevas películas y series</h1>

          <!-- Mensaje de saludo (reactivo) -->
          <p id="greeting">{{ saludo }}</p>

          <p class="lead">
            Reseñas de la comunidad, noticias y un recomendador inteligente para decidir
            qué ver hoy. Todo en un mismo lugar.
          </p>

          <div class="cta-row">
            <RouterLink class="btn btn-primary" to="/recommender">
              Probar Recomendador
            </RouterLink>
            <RouterLink class="btn btn-ghost" to="/news">
              Ver estrenos
            </RouterLink>
          </div>

          <ul class="kpis">
            <li class="kpi">
              <strong>+1K</strong><span>títulos curados</span>
            </li>
            <li class="kpi">
              <strong>4.7★</strong><span>promedio comunidad</span>
            </li>
            <li class="kpi">
              <strong>24/7</strong><span>novedades</span>
            </li>
          </ul>

          <p class="tiny">Tendencias actualizadas diario</p>
        </div>
      </div>
      <div class="hero-gradient"></div>
    </section>

    <!-- DESTACADOS -->
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="grad-subtitle">Destacados de la semana</h2>
          <RouterLink class="link" to="/library">Ver todo →</RouterLink>
        </div>
        <FeaturedGrid />
      </div>
    </section>

    <!-- BLOQUE: RESEÑAS + NOTICIAS -->
    <section class="section">
      <div class="container split">
        <LatestReviewsPanel />
        <NewsPanel />
      </div>
    </section>

    <!-- COMUNIDAD / QUIZ -->
    <section class="section">
      <div class="container community">
        <div>
          <h2 class="grad-subtitle">Comunidad &amp; Quiz</h2>
          <p>
            Responde 5 preguntas y te sugerimos qué ver.
            Comparte teorías con fans.
          </p>
        </div>

        <div class="cta-row">
          <!-- Ya NO usamos href="#quiz-panel" ni :target, solo estado Vue -->
          <button
            type="button"
            class="btn btn-primary"
            @click="showQuiz = true"
          >
            Jugar el quiz
          </button>

          <RouterLink class="btn btn-light" to="/top">
            Ver Top 10
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- OVERLAY QUIZ controlado por estado -->
    <QuizOverlay
      v-if="showQuiz"
      @close="showQuiz = false"
    />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

// Usa rutas relativas si el @ te da problemas (así como lo pusiste)
import FeaturedGrid from '../components/FeaturedGrid.vue'
import LatestReviewsPanel from '../components/LatestReviewsPanel.vue'
import NewsPanel from '../components/NewsPanel.vue'
import QuizOverlay from '../components/QuizOverlay.vue'

// Estado local para abrir/cerrar el overlay del quiz
const showQuiz = ref(false)

// Mensaje de saludo según la hora
const saludo = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '¡Buenos días! ☀️'
  if (h < 19) return '¡Buenas tardes! 🎬'
  return '¡Buenas noches! 🌙'
})
</script>
