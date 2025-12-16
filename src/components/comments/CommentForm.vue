<template>
  <form class="cform" @submit.prevent="submit" aria-label="Formulario de comentario">
    <div class="row2">
      <div class="field">
        <label class="label">Nombre (opcional)</label>
        <input
          v-model.trim="author"
          class="input"
          maxlength="30"
          placeholder="Tu nombre"
          :disabled="isSubmitting"
        />
      </div>

      <div class="field">
        <label class="label">Comentario</label>
        <textarea
          v-model.trim="text"
          class="textarea"
          rows="3"
          placeholder="Escribe tu comentario…"
          :aria-invalid="!!err"
          :disabled="isSubmitting"
        />
      </div>
    </div>

    <div class="foot">
      <p class="meta" :class="{ error: !!err }" aria-live="polite">
        {{ err || "Mínimo 3 caracteres. Máximo 240." }}
      </p>

      <button
        class="btn btn-primary"
        type="submit"
        :disabled="isSubmitting || text.trim().length < 3 || text.trim().length > 240"
      >
        <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
        {{ isSubmitting ? "Publicando..." : "Publicar" }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  tmdbId: { type: [String, Number], required: true },
});

const emit = defineEmits(["add-comment"]);

const author = ref("");
const text = ref("");
const err = ref("");
const isSubmitting = ref(false);

const lastAuthorKey = "mv_comments_last_author";

onMounted(() => {
  const saved = localStorage.getItem(lastAuthorKey);
  if (saved) author.value = saved;
});

// recuerda el último nombre
watch(author, (v) => {
  const name = (v || "").trim();
  if (!name) return;
  localStorage.setItem(lastAuthorKey, name);
});

// validación pro
watch(text, () => {
  const t = text.value.trim();
  if (!t) err.value = "";
  else if (t.length < 3) err.value = "Muy corto (mín. 3).";
  else if (t.length > 240) err.value = "Muy largo (máx. 240).";
  else err.value = "";
});

async function submit() {
  const t = text.value.trim();
  if (t.length < 3 || t.length > 240) return;

  isSubmitting.value = true;

  emit("add-comment", {
    author: (author.value || "").trim() || "Anónimo",
    text: t,
  });

  // fake loading (se ve premium)
  await new Promise((r) => setTimeout(r, 550));

  text.value = "";
  err.value = "";
  isSubmitting.value = false;
}
</script>

<style scoped>
.cform{
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(15,23,42,0.22);
}

.row2{
  display: grid;
  gap: 10px;
}

.field{
  display: grid;
  gap: 8px;
}

.label{
  font-size: 0.85rem;
  opacity: 0.9;
  color: var(--muted);
}

.input,
.textarea{
  background: rgba(15, 22, 36, 0.88);
  border: 1px solid rgba(255,255,255,0.12);
  color: inherit;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  font: inherit;
  outline: none;
  transition: border-color .18s ease, box-shadow .18s ease, transform .12s ease;
}
.input:focus,
.textarea:focus{
  border-color: rgba(122,167,255,0.65);
  box-shadow: 0 0 0 3px rgba(122,167,255,0.14);
}
.input:disabled,
.textarea:disabled{
  opacity: .65;
  cursor: not-allowed;
}

.foot{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.meta{
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}
.meta.error{
  color: #ff879b;
  opacity: 1;
}

.spinner{
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(11,15,23,.35);
  border-top-color: rgba(11,15,23,.9);
  display: inline-block;
  animation: spin .7s linear infinite;
}

@keyframes spin{
  to{ transform: rotate(360deg); }
}
</style>
