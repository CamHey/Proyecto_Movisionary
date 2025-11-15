<template>
  <div class="panel">
    <h2 class="panel-title">Últimas reseñas</h2>
    <ul class="list">
      <li><RouterLink class="item" to="/reviews"><span>“Brutal y elegante” — Dune 2</span><em>4.5★</em></RouterLink></li>
      <li><RouterLink class="item" to="/reviews"><span>“Una masterclass de tensión” — The Bear</span><em>4.7★</em></RouterLink></li>
      <li><RouterLink class="item" to="/reviews"><span>“La animación del año” — Arcane</span><em>4.9★</em></RouterLink></li>
    </ul>
    <RouterLink class="btn btn-light" to="/reviews">Escribir una reseña</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
