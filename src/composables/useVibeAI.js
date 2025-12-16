// src/composables/useVibeAI.js
import { ref } from "vue";

const BASE = import.meta.env.VITE_VIBE_API_BASE || "http://44.211.237.7";

export function useVibeAI() {
  const loading = ref(false);
  const error = ref("");
  const text = ref("");
  const audioUrl = ref("");
  const lastJobId = ref("");

  async function generate({
    tema,
    tono = "relajado",
    duracion = 30,
    movieId = null,
    requireAudio = false, // ✅ si es true, exige audio_url sí o sí
  }) {
    loading.value = true;
    error.value = "";
    text.value = "";
    audioUrl.value = "";
    lastJobId.value = "";

    try {
      const res = await fetch(`${BASE}/vibe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, tono, duracion, movieId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      text.value = data.text || "";
      audioUrl.value = data.audio_url || "";
      lastJobId.value = data.job_id || "";

      if (requireAudio && !audioUrl.value) {
        error.value = "No se pudo generar audio.";
      }

      return data;
    } catch (e) {
      error.value = e?.message || "Error VibeAI";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, text, audioUrl, lastJobId, generate };
}
