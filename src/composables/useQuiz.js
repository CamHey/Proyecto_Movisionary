// src/composables/useQuiz.js
import { ref, computed, watch } from 'vue'

export function useQuiz(fields, storageKey = 'quiz-state-v1') {
  // objeto { mood: null, genero: null, ... }
  const data = ref(Object.fromEntries(fields.map(f => [f, null])))
  const currentStep = ref(1)
  const totalSteps = fields.length

  const persist = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          data: data.value,
          currentStep: currentStep.value
        })
      )
    } catch {}
  }

  const restore = () => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const s = JSON.parse(raw)
      if (s?.data) data.value = { ...data.value, ...s.data }
      if (s?.currentStep) currentStep.value = s.currentStep
    } catch {}
  }

  // ✅ helpers (por si alguna vista los usa)
  const setAnswer = (key, val) => {
    if (key in data.value) {
      data.value[key] = val
      persist()
    }
  }

  const getAnswer = (key) => data.value[key]

  const toPayload = () => ({ ...data.value })

  const goTo = (n) => {
    currentStep.value = Math.min(Math.max(1, n), totalSteps)
    persist()
  }

  const next = () => goTo(currentStep.value + 1)
  const prev = () => goTo(currentStep.value - 1)

  const progressPct = computed(() =>
    Math.round((currentStep.value / totalSteps) * 100)
  )

  const reset = () => {
    data.value = Object.fromEntries(fields.map(f => [f, null]))
    currentStep.value = 1
    persist()
  }

  restore()

  // ✅ Persist automático cuando cambian respuestas por v-model
  watch(() => data.value, () => persist(), { deep: true })

  return {
    data,
    currentStep,
    totalSteps,
    progressPct,
    setAnswer,
    getAnswer,
    toPayload,
    goTo,
    next,
    prev,
    reset
  }
}
