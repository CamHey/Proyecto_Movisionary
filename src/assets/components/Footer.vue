<template>
  <footer class="mv-footer">
    <div class="container mv-footer__wrap">
      <p>© {{ new Date().getFullYear() }} Movisionary — Proyecto académico</p>
      <nav class="foot-links" aria-label="Links secundarios">
            <RouterLink to="/about">Acerca de</RouterLink>
            <RouterLink to="/contact">Contacto</RouterLink>
            <RouterLink to="/map">Mapa de streaming</RouterLink>
            <RouterLink to="/tmdb">Demo TMDb</RouterLink>
            </nav>
    </div>
  </footer>
</template>

<script setup></script>