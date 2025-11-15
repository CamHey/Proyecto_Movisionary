<template>
  <section id="inicio" class="mv-hero">
    <div class="mv-hero__content container">
      <h1>Explora películas y series</h1>
      <p>Reseñas, tops, noticias y trivias — todo en un solo lugar.</p>
      <div class="mv-hero__actions">
        <!-- Usamos RouterLink para ir a la “cartelera” (por ejemplo /library) -->
        <RouterLink to="/library" class="btn btn-primary">
          Ver cartelera
        </RouterLink>

        <!-- Ya NO usamos href="#quiz": disparamos un evento al padre -->
        <button
          type="button"
          class="btn"
          @click="emit('start-quiz')"
        >
          Jugar Quiz
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'

// Evento que el padre puede escuchar: <Hero @start-quiz="showQuiz = true" />
const emit = defineEmits(['start-quiz'])
</script>
