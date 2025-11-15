<template>
  <div id="movisionary">
    <Header />
    <main><RouterView /></main>
    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>
