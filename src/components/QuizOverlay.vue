<!-- src/components/QuizOverlay.vue -->
<template>
  <div
    id="quiz-panel"
    class="quiz-overlay"
    aria-modal="true"
    role="dialog"
    @click.self="close"
  >
    <div class="quiz-panel">
      <header class="quiz-header">
        <h2 id="quiz-title">Quiz rápido (5 preguntas)</h2>
        <button
          type="button"
          class="icon-close"
          aria-label="Cerrar"
          @click="close"
        >
          ✕
        </button>
      </header>

      <div class="quiz-progress">
        <div class="bar" :style="{ width: progressPct + '%' }"></div>
        <span id="quizStepLabel">{{ currentStep }} / {{ totalSteps }}</span>
      </div>

      <div class="quiz-grid">
        <!-- Sidebar -->
        <aside class="quiz-sidebar">
          <ol class="step-list" id="quizSteps">
            <li
              v-for="(f, i) in fields"
              :key="f"
              :class="{
                active: i + 1 === currentStep,
                done: i + 1 < currentStep
              }"
              @click="jump(i + 1)"
            >
              {{ labels[f] }}
            </li>
          </ol>
          <p class="tiny">
            Al terminar te mando al recomendador con tus respuestas.
          </p>
        </aside>

        <!-- Contenido -->
        <main class="quiz-content">
          <form id="quizForm" @submit.prevent="finish">
            <fieldset
              v-for="(f, i) in fields"
              :key="f"
              class="step"
              :class="{ active: i + 1 === currentStep }"
            >
              <legend>{{ labels[f] }}</legend>

              <label v-for="op in options[f]" :key="op">
                <input
                  type="radio"
                  :name="f"
                  :value="op"
                  v-model="data[f]"
                />
                {{ op }}
              </label>
            </fieldset>

            <footer class="quiz-footer">
              <button type="button" class="btn btn-ghost" @click="close">
                Cerrar
              </button>

              <button
                type="button"
                class="btn btn-ghost"
                id="btnPrev"
                :disabled="currentStep === 1"
                @click="prev"
              >
                Atrás
              </button>

              <button
                v-if="currentStep < totalSteps"
                type="button"
                class="btn btn-primary"
                id="btnNext"
                @click="nextGuard"
              >
                Siguiente
              </button>

              <button
                v-else
                type="submit"
                class="btn btn-primary"
                id="btnFinish"
              >
                Ver sugerencias
              </button>
            </footer>
          </form>
        </main>

        <!-- Preview -->
        <aside class="quiz-preview">
          <h3>Tu selección</h3>
          <div id="quizSummary" class="chips">
            <span v-for="f in fields" :key="f" class="chip">
              <strong>{{ labels[f].toLowerCase() }}:</strong>
              {{ data[f] ?? '—' }}
            </span>
          </div>
          <p class="hint">Esto se manda por query params.</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useQuiz } from '../composables/useQuiz'

const emit = defineEmits(['close'])

const fields = ['genero', 'mood', 'duracion', 'anio', 'idioma']

const labels = {
  genero: '¿Qué género te provoca hoy?',
  mood: '¿Qué mood quieres?',
  duracion: 'Duración / formato preferido',
  anio: '¿Te importa el año de estreno?',
  idioma: 'Idioma preferido'
}

const options = {
  genero: [
    'Acción',
    'Aventura',
    'Comedia',
    'Drama',
    'Terror',
    'Suspenso / Thriller',
    'Ciencia ficción',
    'Fantasía',
    'Animación',
    'Romance',
    'Crimen',
    'Documental'
  ],
  mood: [
    'Ligero / divertido',
    'Emocionante / adrenalina',
    'Reflexivo / emotivo',
    'Oscuro / retorcido',
    'Épico / gran escala',
    'Familiar'
  ],
  duracion: [
    'Película corta (≤100 min)',
    'Película media (100–130)',
    'Película larga (>130)',
    'Serie corta (6–10 ep)',
    'Mini-serie (3–6 ep)'
  ],
  anio: [
    'Muy reciente (2023+)',
    'Reciente (2018–2022)',
    '2000–2017',
    'Clásicos (antes de 2000)',
    'Indiferente'
  ],
  idioma: [
    'Español / Latam',
    'Inglés',
    'Coreano',
    'Japonés',
    'Francés',
    'Otro / Indiferente'
  ]
}

const { data, currentStep, totalSteps, progressPct, next, prev, toPayload, goTo } =
  useQuiz(fields)

const router = useRouter()

const currentAnswered = () => {
  const key = fields[currentStep.value - 1]
  return !!data.value[key]
}

const feedbackRequired = () =>
  window.alert('Responde esta pregunta para continuar 🙂')

const nextGuard = () => {
  if (!currentAnswered()) return feedbackRequired()
  next()
}

const finish = () => {
  if (!currentAnswered()) return feedbackRequired()
  const payload = toPayload()
  router.push({ path: '/recommender', query: payload })
  close()
}

const close = () => emit('close')

const jump = (n) => {
  if (n < currentStep.value) return goTo(n)
  if (!currentAnswered()) return feedbackRequired()
  goTo(n)
}
</script>

