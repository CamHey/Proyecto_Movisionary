// src/composables/useTheme.js  (déjalo así)
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'pref-theme'
const CLASS_LIGHT = 'theme-light'

export function useTheme() {
  const isLight = ref(false)

  const systemPrefersLight = () =>
    window.matchMedia?.('(prefers-color-scheme: light)').matches

  const apply = (mode) => {
    isLight.value = (mode === 'light')
    document.body.classList.toggle(CLASS_LIGHT, isLight.value)
  }

  const toggle = () => {
    const next = isLight.value ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    apply(saved === 'light' || saved === 'dark' ? saved : (systemPrefersLight() ? 'light' : 'dark'))
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) apply(e.newValue)
    })
  })

  return { isLight, toggle }
}
