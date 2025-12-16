<template>
  <section class="card" style="padding:14px;">
    <h3 style="margin:0 0 6px;">Foro por película (TMDb)</h3>
    <p class="meta" style="margin-top:0;">
      Elige un título y deja comentarios (se guardan por tmdbId en localStorage).
    </p>

    <TmdbPicker @pick="onPick" />

    <div v-if="picked" style="margin-top:10px;">
      <p class="meta">
        Seleccionado: <strong>{{ picked.title || picked.name }}</strong>
        · ID: {{ picked.id }}
      </p>

      <CommentsSection :tmdbId="picked.id" />
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import TmdbPicker from "@/components/TmdbPicker.vue"; // usa tu componente existente
import CommentsSection from "./CommentsSection.vue";

const picked = ref(null);
function onPick(movie) { picked.value = movie; }
</script>
