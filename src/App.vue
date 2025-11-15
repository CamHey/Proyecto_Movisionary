<!-- !Componente raíz (Root)-->

<!-- El componente raíz de la aplicación es App.vue, montado desde main.js.  -->
<!-- Desde aqui se define el layout general y se renderizan las vistas mediante el RouterView -->
<script setup>
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
</script>
<template>
  <div id="movisionary">
    <!-- ! componente reutilizable -->
    <Header v-if="route.name !== 'kids'" />
    <main>
      <RouterView />
    </main>
    <!-- ! componente reutilizable -->
    <Footer v-if="route.name !== 'kids'" />
  </div>
</template>