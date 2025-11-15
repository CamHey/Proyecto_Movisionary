// src/composables/useTheme.js
import { ref, computed, watch, onMounted } from 'vue'

const STORAGE_KEY = 'movisionary-theme'

// estado compartido
const theme = ref('dark')
let hasInitialized = false
let hasStorageListener = false

function applyTheme(value) {
  const root = document.documentElement

  root.setAttribute('data-theme', value)
  root.classList.toggle('theme-dark', value === 'dark')
  root.classList.toggle('theme-light', value === 'light')
}

function initTheme() {
  if (hasInitialized) return
  hasInitialized = true

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    theme.value = stored
  } else {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }

  applyTheme(theme.value)
}

function setupStorageSync() {
  if (hasStorageListener) return
  hasStorageListener = true

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    if (event.newValue === 'light' || event.newValue === 'dark') {
      theme.value = event.newValue
    }
  })
}

export function useTheme() {
  onMounted(() => {
    initTheme()
    setupStorageSync()
  })

  watch(
    theme,
    (value) => {
      localStorage.setItem(STORAGE_KEY, value)
      applyTheme(value)
    },
    { immediate: true }
  )

  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const setTheme = (value) => {
    if (value !== 'light' && value !== 'dark') return
    theme.value = value
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme
  }
}
