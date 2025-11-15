<template>
  <div class="page-map">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Integraciones</p>
        <h1 class="gradient-title">Mapa de Streaming</h1>
        <p class="sub">
          Responde a la pregunta: “¿Dónde puedo ver cada película o serie?”,
          mapeando el catálogo contra las plataformas de streaming (demo).
        </p>
      </div>
    </section>

    <!-- Contenido -->
    <main class="container">
      <section class="grid-auto">
        <article class="card">
          <div class="content">
            <h2>Descripción de la integración</h2>
            <p class="meta">
              Esta sección funciona como un mapa conceptual de disponibilidad:
              por cada título del catálogo se listan las plataformas donde está
              disponible (Netflix, Disney+, Prime Video, HBO Max, etc.).
            </p>
            <ul class="meta-list">
              <li>
                En esta demo los datos son simulados, pero el diseño está listo
                para conectarse a una API real en el futuro.
              </li>
              <li>
                Se pueden aplicar filtros por plataforma y tipo de contenido
                (películas o series).
              </li>
              <li>
                La vista es útil para responder rápidamente “¿dónde lo veo?” sin
                salir de Movisionary.
              </li>
            </ul>
          </div>
        </article>

        <article class="card">
          <StreamingMap />
        </article>
      </section>
    </main>

    <footer class="main-footer">
      <div class="container">
        <p>© 2025 Movisionary · Mapa de streaming (demo)</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import StreamingMap from '../components/StreamingMap.vue'
</script>

<style scoped>
.meta-list {
  margin-top: 0.75rem;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  opacity: 0.95;
}

.meta-list li + li {
  margin-top: 0.25rem;
}
</style>
