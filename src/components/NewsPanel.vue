<template>
  <div class="panel">
    <h2 class="panel-title">Noticias & estrenos</h2>
    <ul class="list">
      <li><RouterLink class="item" to="/news"><span>Trailer final de Arcane S2</span><em>Hoy</em></RouterLink></li>
      <li><RouterLink class="item" to="/news"><span>Reestreno IMAX confirmado</span><em>Ayer</em></RouterLink></li>
      <li><RouterLink class="item" to="/news"><span>Calendario de premiaciones</span><em>Esta semana</em></RouterLink></li>
    </ul>
    <RouterLink class="btn btn-ghost" to="/news">Ver más noticias</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>